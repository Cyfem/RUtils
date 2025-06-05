import axios, { AxiosResponse, AxiosRequestConfig, Method } from 'axios';
import { message } from 'antd';
import { at } from 'lodash';
import {
  _defaultErrorCodeHandler,
  _defaultHttpErrorCodeHandler,
  _defaultOtherErrorCodeHandler,
  defaultEquals,
} from '../_utils/_defaults';
import { Cache } from '../cache';
export type StorageType = 'sessionStorage' | 'localStorage' | 'indexedDB';

export type ErrorHandlerReturnType<D> = {
  replaceResData?: D;
  throwError?: boolean | 'default';
};

export interface Options<Params = any, Data = any> {
  baseURL?: string;
  throwError?: boolean;

  enableCache?: boolean;
  cacheKeyEquals?: (prev: Params, next: Params) => boolean;
  cacheData?: boolean;
  cacheTime?: number;
  cacheDataInStorage?: StorageType;
  cacheDataKey?: string;
  indexDBName?: string;

  errorCodePath?: string;
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
  defaultErrorCodeHandler?: (
    code: string,
    data: Data,
    res: AxiosResponse<Data>,
  ) => ErrorHandlerReturnType<Data> | void;

  successCodes?: string[];

  httpErrorCodeMap?: Record<
    string,
    | string
    | ((
        code: number,
        res: AxiosResponse<Data>,
        requestParam: RequestOptions<Params>,
      ) => ErrorHandlerReturnType<Data> | void)
  >;
  defaultHttpErrorCodeHandler?: (
    code: number,
    error: any,
  ) => ErrorHandlerReturnType<Data> | void;
  otherErrorHandler?: (error: any) => ErrorHandlerReturnType<Data> | void;
  axiosOptions?: Omit<
    AxiosRequestConfig<Params>,
    'method' | 'url' | 'params' | 'data'
  >;
}

export interface RequestOptions<Param> {
  method: Method;
  url: string;
  data?: Param;
  params?: Param;
}
export function createBaseRequest(baseOptions?: Options) {
  const { baseURL } = Object(baseOptions);

  // 创建新的 Axios 实例
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

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

      const {
        baseURL,
        enableCache = false,
        cacheData = false,
        defaultErrorCodeHandler = _defaultErrorCodeHandler,
        defaultHttpErrorCodeHandler = _defaultHttpErrorCodeHandler,
        otherErrorHandler = _defaultOtherErrorCodeHandler,
        errorCodePath = 'code',
        cacheTime = 60,
        errorCodeMap = {},
        successCodes = ['0', '200'],
        httpErrorCodeMap = {},
        axiosOptions = {},
        throwError = true,
      } = { ...baseOptions, ...createOptions, ...options };
      if (enableCache) {
        const cacheItem = cache.getCache(params);
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
          baseURL,
          ...axiosOptions,
        })
        .then(
          (res) => {
            const errorCode = String(at(res.data, errorCodePath));
            if (successCodes.includes(errorCode)) {
              if (cacheData) {
                cache.setCache(params, res.data, { cacheTime });
              }
              return res.data;
            }

            const { [errorCode]: customHandler = defaultErrorCodeHandler } =
              errorCodeMap;

            const err = new Error('服务端错误');
            err.type = 'server';
            err.data = res;

            if (typeof customHandler === 'string') {
              message.error(customHandler);
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

              const err = new Error('服务端错误');
              err.type = 'http';
              err.data = error;

              if (typeof customHandler === 'string') {
                message.error(customHandler);
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

              const err = new Error('服务端错误');
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
