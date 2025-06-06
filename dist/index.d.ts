import { AxiosResponse, Method, AxiosRequestConfig } from 'axios';

declare class IndexedDBStorage {
    private dbName;
    private storeName;
    private db;
    constructor(dbName: string, storeName: string);
    private _open;
    private _getStore;
    setItem<T>(key: string, value: T): Promise<void>;
    getItem<T = any>(key: string): Promise<T>;
}

type StorageType = 'sessionStorage' | 'localStorage' | 'indexedDB';
interface ICache<Param, Data> {
    params: Param;
    data: Data;
    expireTime: string;
}
interface ICacheOptions<Param> {
    storageType?: StorageType;
    cacheKey?: string;
    cacheTime?: number;
    cacheKeyEquals: (prev: Param, next: Param) => boolean;
    indexDBName?: string;
}
declare const StorageMap: Record<StorageType | string, Storage>;
declare class Cache<Param, Data> {
    cache: ICache<Param, Data>[];
    private cacheOptions;
    storage?: Storage | IndexedDBStorage;
    constructor(cacheType?: StorageType, cacheKey?: string, cacheTime?: number, indexDBName?: string, cacheKeyEquals?: (prev: Param, next: Param) => boolean);
    private _init;
    private _filterExpired;
    private _saveToStorage;
    setCache(params: Param, data: Data, cacheOptions?: Omit<ICacheOptions<Param>, 'storageType' | 'cacheKey' | 'cacheKeyEquals'>): void;
    getCache(params: Param): Data;
    clear(): void;
}

type ErrorHandlerReturnType<D> = {
    replaceResData?: D;
    throwError?: boolean | 'default';
};
interface Options<Params = any, Data = any> {
    baseURL?: string;
    throwError?: boolean;
    defaultMessageShower?: (message: string) => void;
    enableCache?: boolean;
    cacheKeyEquals?: (prev: Params, next: Params) => boolean;
    cacheData?: boolean;
    cacheTime?: number;
    cacheDataInStorage?: StorageType;
    cacheDataKey?: string;
    indexDBName?: string;
    errorCodePath?: string;
    errorCodeMap?: Record<string, string | ((code: string, data: Data, res: AxiosResponse<Data>, requestParam: RequestOptions<Params>) => ErrorHandlerReturnType<Data> | void)>;
    defaultErrorCodeHandler?: (code: string, data: Data, res: AxiosResponse<Data>) => ErrorHandlerReturnType<Data> | void;
    successCodes?: string[];
    httpErrorCodeMap?: Record<string, string | ((code: number, res: AxiosResponse<Data>, requestParam: RequestOptions<Params>) => ErrorHandlerReturnType<Data> | void)>;
    defaultHttpErrorCodeHandler?: (code: number, error: any) => ErrorHandlerReturnType<Data> | void;
    otherErrorHandler?: (error: any) => ErrorHandlerReturnType<Data> | void;
    axiosOptions?: Omit<AxiosRequestConfig<Params>, 'method' | 'url' | 'params' | 'data'>;
}
interface RequestOptions<Param> {
    method: Method;
    url: string;
    data?: Param;
    params?: Param;
}
declare function createBaseRequest(baseOptions?: Options): <Param, Data extends Record<any, any>>(requestOptions: RequestOptions<Param>, createOptions?: Omit<Options<Param, Data>, "baseURL">) => {
    (requestParam?: Omit<RequestOptions<Param>, "url" | "method">, options?: Omit<Options<Param, Data>, "baseURL" | "cacheDataKey" | "cacheDataInStorage" | "cacheKeyEquals">): Promise<Data>;
    clearCache(): void;
};

type IHookStateInitialSetter<S> = () => S;
type IHookStateInitAction<S> = S | IHookStateInitialSetter<S>;
type IHookStateSetter<S> = ((prevState: S) => S) | (() => S);
type IHookStateSetAction<S> = S | IHookStateSetter<S>;
type IHookStateResolvable<S> = S | IHookStateInitialSetter<S> | IHookStateSetter<S>;
declare function createStateStore<S>(initialState?: S): {
    use: () => [S, (state: IHookStateSetAction<S>) => void];
    get: () => S;
    set: (state: IHookStateSetAction<S>) => void;
    watch: (callback: (state: S) => S | void) => () => void;
};

export { Cache, StorageMap, createBaseRequest, createStateStore };
export type { ErrorHandlerReturnType, ICache, ICacheOptions, IHookStateInitAction, IHookStateInitialSetter, IHookStateResolvable, IHookStateSetAction, IHookStateSetter, Options, RequestOptions };
