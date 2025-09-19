import axios, { AxiosResponse, AxiosRequestConfig, Method } from 'axios';
import { at } from 'lodash';
import {
  _defaultErrorCodeHandler,
  _defaultHttpErrorCodeHandler,
  _defaultOtherErrorCodeHandler,
} from './defaultHandlers';
import defaultEquals from '../defaultEquals';
import Cache, { type StorageType } from '../cache';
import RequestError,{type RequestErrorType} from './error';

/**
 * 错误处理器返回类型
 * @template D 响应数据类型
 */
export type ErrorHandlerReturnType<D> = {
  /** 替换响应数据 */
  replaceResData?: D;
  /** 
   * 是否抛出错误
   * - true: 强制抛出错误
   * - false: 不抛出错误
   * - 'default': 使用默认错误处理逻辑
   */
  throwError?: boolean | 'default';
};

/**
 * 请求配置选项接口
 * @template Params 请求参数类型
 * @template Data 响应数据类型
 */
export interface Options<Params = any, Data = any> {
  /** 请求基础URL，默认为空字符串 */
  baseURL?: string;
  /** 
   * 是否抛出错误
   * @default true 
   */
  throwError?: boolean;

  /** 
   * 默认的消息展示函数
   * @default window.alert 
   */
  defaultMessageShower?:(message: string) => void;

  /** 
   * 是否启用缓存功能
   * @default false 
   */
  enableCache?: boolean;
  /** 
   * 缓存键比较函数
   * @default defaultEquals 使用 JSON.stringify 进行比较
   */
  cacheKeyEquals?: (prev: Params, next: Params) => boolean;
  /** 
   * 是否将响应数据存入缓存
   * @default false 
   */
  cacheData?: boolean;
  /** 
   * 缓存时间（秒）
   * @default 60 
   */
  cacheTime?: number;/** 
   * 缓存数据的存储类型
   * - localStorage: 使用浏览器本地存储，数据永久保存
   * - sessionStorage: 使用会话存储，关闭浏览器后清除
   * - indexedDB: 使用 IndexedDB 数据库存储
   * - 不填则仅在内存中缓存，页面刷新后清除
   */
  cacheDataInStorage?: StorageType;
  /** 
   * 缓存数据的键名
   * @default `${method}:${baseURL}${url}` 默认使用请求方法、基础URL和请求路径组合
   */
  cacheDataKey?: string;
  /** 
   * IndexedDB 数据库名称
   * @default '__apiCacheDatabase__' 
   */
  indexDBName?: string;
  /** 
   * 错误码在响应数据中的路径
   * @default 'code' 
   */
  errorCodePath?: string;  /** 
   * 错误码映射表
   * 可以配置错误码对应的错误信息或处理函数
   * @default {} 空对象，使用默认处理函数
   */
  errorCodeMap?: Record<
    string,
    | string
    | ((
        code: string,
        data: Data,
        res: AxiosResponse<Data>,
        requestParam: RequestOptions<Params>,
      ) => ErrorHandlerReturnType<Data> | void)
  >;
  /**
   * 默认错误码处理函数
   * 当错误码不在 errorCodeMap 中时调用
   */
  defaultErrorCodeHandler?: (
    code: string,
    data: Data,
    res: AxiosResponse<Data>,
  ) => ErrorHandlerReturnType<Data> | void;  /** 
   * 成功状态的错误码列表
   * @default ['0', '200'] 
   */
  successCodes?: string[];

  /** 
   * HTTP 错误码映射表
   * 可以配置 HTTP 状态码对应的错误信息或处理函数
   * @default {} 空对象，使用默认处理函数
   */
  httpErrorCodeMap?: Record<
    string,
    | string
    | ((
        code: number,
        res: AxiosResponse<Data>,
        requestParam: RequestOptions<Params>,
      ) => ErrorHandlerReturnType<Data> | void)
  >;
  /**
   * 默认 HTTP 错误码处理函数
   * 当 HTTP 状态码不在 httpErrorCodeMap 中时调用
   */
  defaultHttpErrorCodeHandler?: (
    code: number,
    error: any,
  ) => ErrorHandlerReturnType<Data> | void;
  /**
   * 其他错误处理函数
   * 处理非 HTTP 错误和非业务错误码的错误
   */
  otherErrorHandler?: (error: any) => ErrorHandlerReturnType<Data> | void;
  axiosOptions?: Omit<
    AxiosRequestConfig<Params>,
    'method' | 'url' | 'params' | 'data'
  >;
}

/**
 * 请求参数接口
 * @template Param 请求参数类型
 */
export interface RequestOptions<Param> {
  /** HTTP 请求方法 */
  method: Method;
  /** 请求URL */
  url: string;
  /** POST/PUT 等请求的数据 */
  data?: Param;
  /** URL 查询参数 */
  params?: Param;
}

/**
 * 创建基础请求实例
 * @param baseOptions 基础配置选项
 * @returns 请求创建函数
 */
export default function createBaseRequest(baseOptions?: Options) {
  const { baseURL } = Object(baseOptions);

  // 创建新的 Axios 实例并配置基础URL和跨域凭证
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });
  /**
   * 创建请求函数
   * @template Param 请求参数类型
   * @template Data 响应数据类型，必须是对象类型
   * @param requestOptions 请求配置
   * @param createOptions 创建选项（覆盖基础配置）
   * @returns 发送请求的函数
   */
  return function createRequest<Param, Data extends Record<any, any>>(
    requestOptions: RequestOptions<Param>,
    createOptions?: Omit<Options<Param, Data>, 'baseURL'>,
  ) {
    const { method, url } = { ...requestOptions };

    const {
      baseURL,
      cacheDataKey = `${method}:${baseURL}${url}`,
      cacheDataInStorage,
      cacheKeyEquals = defaultEquals,
      cacheTime,
      indexDBName = '__apiCacheDatabase__',
    } = {
      ...baseOptions,
      ...createOptions,
    };

    const cache: Cache<Param, Data> = new Cache(
      cacheDataInStorage,
      cacheDataKey,
      cacheTime,
      indexDBName,
      cacheKeyEquals,
    );

    function request(
      requestParam?: Omit<RequestOptions<Param>, 'url' | 'method'>,
      options?: Omit<
        Options<Param, Data>,
        'baseURL' | 'cacheDataKey' | 'cacheDataInStorage' | 'cacheKeyEquals'
      >,
    ): Promise<Data> {
      const {
        method,
        url,
        data = {} as Param,
        params = {} as Param,
      } = { ...requestOptions, ...requestParam };
      let requestDataOrParams = params
      if(method.toLowerCase() === 'post'){
        requestDataOrParams = data
      }

      
      const { defaultMessageShower = console.error } = { ...baseOptions, ...createOptions, ...options };



      const {
        enableCache = false,
        cacheData = false,
        defaultErrorCodeHandler = _defaultErrorCodeHandler.bind(null, defaultMessageShower),
        defaultHttpErrorCodeHandler = _defaultHttpErrorCodeHandler.bind(null, defaultMessageShower),
        otherErrorHandler = _defaultOtherErrorCodeHandler.bind(null, defaultMessageShower),
        errorCodePath = 'code',
        cacheTime = 60,
        errorCodeMap = {},
        successCodes = ['0', '200'],
        httpErrorCodeMap = {},
        axiosOptions = {},
        throwError = true,
      } = { ...baseOptions, ...createOptions, ...options };
      if (enableCache) {
        const cacheItem = cache.getCache(requestDataOrParams);
        if (cacheItem) {
          return Promise.resolve(cacheItem);
        }
      }
      return instance
        .request<Data, AxiosResponse<Data>, Param>({
          method,
          url,
          data,
          params,
          ...axiosOptions,
        })
        .then(
          (res) => {
            const errorCode = String(at(res.data, errorCodePath));
            if (successCodes.includes(errorCode)) {
              if (cacheData) {
                cache.setCache(requestDataOrParams, res.data, { cacheTime });
              }
              return res.data;
            }

            const { [errorCode]: customHandler = defaultErrorCodeHandler } =
              errorCodeMap;

            const err = new RequestError('服务端错误','server',res);

            if (typeof customHandler === 'string') {
              defaultMessageShower(customHandler);
            } else {
              const {
                replaceResData = res.data,
                throwError: handlerThrowError = 'default',
              } = <ErrorHandlerReturnType<Data>>(
                Object(customHandler(errorCode, res.data, res, {...requestOptions, ...requestParam}))
              );
              res.data = replaceResData;
              switch (handlerThrowError) {
                case true:
                  throw err;
                case false:
                  return res.data;
                default:
                  break;
              }
            }

            if (throwError) {
              throw err;
            }

            return res.data;
          },
          (error) => {
            if (error.response) {
              // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
              let resData = error;
              const {
                [error.response.status]:
                  customHandler = defaultHttpErrorCodeHandler,
              } = httpErrorCodeMap;

              const err = new RequestError('服务端错误', 'http', error);

              if (typeof customHandler === 'string') {
                defaultMessageShower(customHandler);
              } else {
                const {
                  replaceResData = error,
                  throwError: handlerThrowError = 'default',
                } = <ErrorHandlerReturnType<Data>>(
                  Object(customHandler(error.response.status, error,{...requestOptions, ...requestParam}))
                );

                resData = replaceResData;

                switch (handlerThrowError) {
                  case true:
                    throw err;
                  case false:
                    return resData as Data;
                  default:
                    break;
                }
              }

              if (throwError) {
                throw err;
              }

              return resData as Data;
            } else {
              let resData = error;

              const err = new RequestError('服务端错误','http', error);
              err.type = 'http';
              err.data = error;

              const {
                replaceResData = error,
                throwError: handlerThrowError = 'default',
              } = <ErrorHandlerReturnType<Data>>(
                Object(otherErrorHandler(error))
              );

              resData = replaceResData;

              switch (handlerThrowError) {
                case true:
                  throw err;
                case false:
                  return resData as Data;
                default:
                  break;
              }

              if (throwError) {
                throw err;
              }

              return resData as Data;
            }
          },
        );
    }
    request.clearCache = () => {
      cache.clear();
    };
    return request;
  };
}

export { type RequestError,type RequestErrorType };
