import axios, { AxiosResponse, AxiosRequestConfig, Method } from 'axios';
import at from 'lodash-es/at';
import {
  _defaultErrorCodeHandler,
  _defaultHttpErrorCodeHandler,
  _defaultOtherErrorCodeHandler,
} from './defaultHandlers';
import defaultEquals from '../_utils/defaultEquals';
import Cache, { type StorageType } from '../cache';
import RequestError, { type RequestErrorType } from './error';

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
  defaultMessageShower?: (message: string) => void;

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
  cacheTime?: number;
  /**
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
  errorCodePath?: string;
  /**
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
      ) => ErrorHandlerReturnType<Data> | void | Promise<ErrorHandlerReturnType<Data> | void>)
  >;
  /**
   * 默认错误码处理函数
   * 当错误码不在 errorCodeMap 中时调用
   */
  defaultErrorCodeHandler?: (
    code: string,
    data: Data,
    res: AxiosResponse<Data>,
  ) => ErrorHandlerReturnType<Data> | void | Promise<ErrorHandlerReturnType<Data> | void>;
  /**
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
      ) => ErrorHandlerReturnType<Data> | void | Promise<ErrorHandlerReturnType<Data> | void>)
  >;
  /**
   * 默认 HTTP 错误码处理函数
   * 当 HTTP 状态码不在 httpErrorCodeMap 中时调用
   */
  defaultHttpErrorCodeHandler?: (
    code: number,
    error: any,
  ) => ErrorHandlerReturnType<Data> | void | Promise<ErrorHandlerReturnType<Data> | void>;
  /**
   * 其他错误处理函数
   * 处理非 HTTP 错误和非业务错误码的错误
   */
  otherErrorHandler?: (
    error: any,
  ) => ErrorHandlerReturnType<Data> | void | Promise<ErrorHandlerReturnType<Data> | void>;
  axiosOptions?: Omit<AxiosRequestConfig<Params>, 'method' | 'url' | 'params' | 'data'>;

  // 请求拦截中间件，可支持更改 axiosOptions， requestOptions
  requestMiddlewares?: ((
    options: Options<Params, Data>,
    requestOptions: RequestOptions<Params>,
  ) =>
    | Promise<{
        axiosOptions?: Options<Params, Data>['axiosOptions'];
        requestOptions?: RequestOptions<Params>;
      }>
    | {
        axiosOptions: Options<Params, Data>['axiosOptions'];
        requestOptions?: RequestOptions<Params>;
      })[];

  // 重试次数，仅出错时重试，如果都失败则抛出最后一次的异常(如果配置了抛出异常的话)
  retryTimes?: number;

  /**
   * 请求参数或数据转换函数
   * 可以在发送请求前对参数或数据进行处理
   * @param paramsOrData 请求参数或数据
   * @returns 处理后的参数或数据
   */
  requestParamsOrDataTransfer?: (paramsOrData: Params) => any;

  /**
   * 响应数据转换函数
   * 可以在接收响应数据后对数据进行处理
   * @param data 响应数据
   * @returns 处理后的响应数据
   */
  responseTransfer?: (data: any) => Data;
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
export default function createBaseRequest<D extends Record<any, any>>(
  baseOptions?: Options<any, D>,
) {
  const { baseURL } = Object(baseOptions);

  // 创建新的 Axios 实例并配置基础URL
  const instance = axios.create({
    baseURL: baseURL,
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

    async function request(
      requestParam?: Omit<RequestOptions<Param>, 'url' | 'method'>,
      options?: Omit<
        Options<Param, Data>,
        'baseURL' | 'cacheDataKey' | 'cacheDataInStorage' | 'cacheKeyEquals'
      >,
    ): Promise<Data> {
      const mergedOptions = {
        ...baseOptions,
        ...createOptions,
        ...options,
      } as Options<Param, Data>;
      let {
        requestMiddlewares = [],
        axiosOptions: finalAxiosOptions = {},
        requestParamsOrDataTransfer,
        responseTransfer,
      } = mergedOptions;
      let finalRequestOptions = { ...requestOptions, ...requestParam };

      for (const middleware of requestMiddlewares) {
        const {
          axiosOptions: nextAxiosOptions = finalAxiosOptions,
          requestOptions: nextRequestOptions = finalRequestOptions,
        } = await middleware(
          { ...mergedOptions, axiosOptions: finalAxiosOptions },
          finalRequestOptions,
        );
        finalAxiosOptions = nextAxiosOptions;
        finalRequestOptions = nextRequestOptions;
      }

      const { method, url, data = {} as Param, params = {} as Param } = finalRequestOptions;
      let requestDataOrParams = params;
      if (method.toLowerCase() === 'post') {
        requestDataOrParams = data;
      }

      const { defaultMessageShower = console.error } = {
        ...baseOptions,
        ...createOptions,
        ...options,
      };

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
        // axiosOptions = {},
        throwError = true,
        retryTimes = 0,
      } = { ...baseOptions, ...createOptions, ...options };
      if (enableCache) {
        const cacheItem = cache.getCache(requestDataOrParams);
        if (cacheItem) {
          return Promise.resolve(cacheItem);
        }
      }
      function retry() {
        if (retryTimes > 0) {
          return request(requestParam, { ...options, retryTimes: retryTimes - 1 });
        }
        return null;
      }
      return instance
        .request<Data, AxiosResponse<Data>, Param>({
          method,
          url,
          data: requestParamsOrDataTransfer ? requestParamsOrDataTransfer(data) : data,
          params: requestParamsOrDataTransfer ? requestParamsOrDataTransfer(params) : params,
          ...finalAxiosOptions,
        })
        .then(
          async (res) => {
            const errorCode = String(at(res.data, errorCodePath));
            let finalData: Data = responseTransfer
              ? (responseTransfer(res.data) as Data)
              : res.data;
            if (successCodes.includes(errorCode)) {
              if (cacheData) {
                cache.setCache(requestDataOrParams, finalData, { cacheTime });
              }
              return finalData;
            }
            // 不在成功 code 中，意味着请求失败

            const { [errorCode]: customHandler = defaultErrorCodeHandler } = errorCodeMap;

            const err = new RequestError('服务端错误', 'server', res);

            if (typeof customHandler === 'string') {
              defaultMessageShower(customHandler);

              const retryTask = retry();
              if (retryTask) return retryTask;
            } else {
              const { replaceResData = res.data, throwError: handlerThrowError = 'default' } = <
                ErrorHandlerReturnType<Data>
              >Object(
                (await customHandler(errorCode, res.data, res, {
                  ...requestOptions,
                  ...requestParam,
                })) as Promise<ErrorHandlerReturnType<Data>>,
              );

              const retryTask = retry();
              if (retryTask) return retryTask;

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
          async (error) => {
            if (error.response) {
              // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
              let resData = error;
              const { [error.response.status]: customHandler = defaultHttpErrorCodeHandler } =
                httpErrorCodeMap;

              const err = new RequestError('服务端错误', 'http', error);

              if (typeof customHandler === 'string') {
                defaultMessageShower(customHandler);

                const retryTask = retry();
                if (retryTask) return retryTask;
              } else {
                const { replaceResData = error, throwError: handlerThrowError = 'default' } = <
                  ErrorHandlerReturnType<Data>
                >Object(
                  (await customHandler(error.response.status, error, {
                    ...requestOptions,
                    ...requestParam,
                  })) as Promise<ErrorHandlerReturnType<Data>>,
                );

                const retryTask = retry();
                if (retryTask) return retryTask;

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

              const err = new RequestError('服务端错误', 'http', error);
              err.type = 'http';
              err.data = error;

              const { replaceResData = error, throwError: handlerThrowError = 'default' } = <
                ErrorHandlerReturnType<Data>
              >Object((await otherErrorHandler(error)) as Promise<ErrorHandlerReturnType<Data>>);

              const retryTask = retry();
              if (retryTask) return retryTask;

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

export { type RequestError, type RequestErrorType };
