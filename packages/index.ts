import { Cache } from './cache';
import { createBaseRequest } from './request';
import { IndexedDBStorage } from './indexdb';

export { Cache, createBaseRequest, IndexedDBStorage };
export type { ICache, ICacheOptions, StorageMap } from './cache';
export type {
  ErrorHandlerReturnType,
  StorageType,
  Options,
  RequestOptions,
} from './request';
