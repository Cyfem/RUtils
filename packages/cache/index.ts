import moment from 'moment';
import { IndexedDBStorage } from './indexDB';
import defaultEquals from '../defaultEquals';
export type StorageType = 'sessionStorage' | 'localStorage' | 'indexedDB';

export interface ICache<Param, Data> {
  params: Param;
  data: Data;
  expireTime: string;
}

export interface ICacheOptions<Param> {
  storageType?: StorageType;
  cacheKey?: string;
  cacheTime?: number;
  cacheKeyEquals: (prev: Param, next: Param) => boolean;
  indexDBName?: string;
}

export const StorageMap: Record<StorageType | string, Storage> = {
  localStorage: localStorage,
  sessionStorage: sessionStorage,
};

export default class Cache<Param, Data> {
  cache: ICache<Param, Data>[] = [];
  private cacheOptions: ICacheOptions<Param>;
  storage?: Storage | IndexedDBStorage;
  constructor(
    cacheType?: StorageType,
    cacheKey?: string,
    cacheTime?: number,
    indexDBName = '__apiCacheDatabase__',
    cacheKeyEquals: (prev: Param, next: Param) => boolean = defaultEquals,
  ) {
    this.cacheOptions = {
      storageType: cacheType,
      cacheKey: cacheKey,
      cacheTime: cacheTime,
      indexDBName,
      cacheKeyEquals,
    };
    if (cacheType === 'indexedDB') {
      this.storage = new IndexedDBStorage(indexDBName, 'cacheStore' as string);
    } else if (typeof cacheType === 'string') {
      this.storage = StorageMap[cacheType];
    }
    this._init();
  }

  private async _init() {
    const { storageType: cacheType, cacheKey: cacheKey } = this.cacheOptions;
    if (this.storage instanceof IndexedDBStorage) {
      this.cache = JSON.parse(
        (await this.storage.getItem(cacheKey as string)) || '[]',
      );
    } else if (this.storage instanceof Storage) {
      this.storage = StorageMap[cacheType as string];
      if (this.storage) {
        if (typeof cacheKey === 'string') {
          try {
            this.cache = JSON.parse(
              (this.storage as Storage).getItem(cacheKey as string) || '[]',
            );
          } catch (e) {
            this.cache = [];
            console.error(`缓存数据解析失败，key:${cacheKey}`);
          }
        }
      }
    }
    this._filterExpired();
    this._saveToStorage();
  }
  private _filterExpired() {
    const newCache = this.cache.filter((item) => {
      return moment(item.expireTime).isAfter(moment());
    });
    this.cache = newCache;
  }
  private _saveToStorage() {
    if (this.storage) {
      if (typeof this.cacheOptions.cacheKey === 'string') {
        this.storage.setItem(
          this.cacheOptions.cacheKey,
          JSON.stringify(this.cache),
        );
      }
    }
  }
  setCache(
    params: Param,
    data: Data,
    cacheOptions?: Omit<
      ICacheOptions<Param>,
      'storageType' | 'cacheKey' | 'cacheKeyEquals'
    >,
  ) {
    const { cacheTime, cacheKeyEquals = defaultEquals } = {
      ...this.cacheOptions,
      ...cacheOptions,
    };
    const cacheItemIndex = this.cache.findIndex((item) => {
      return cacheKeyEquals(item.params, params);
    });
    if (cacheItemIndex > -1) {
      this.cache.splice(cacheItemIndex, 1);
    }
    this.cache.push({
      params,
      data,
      expireTime: moment().add(cacheTime, 'seconds').toJSON(),
    });
    this._saveToStorage();
  }
  getCache(params: Param) {
    // debugger;
    const itemIndex = this.cache.findIndex((item) => {
      return this.cacheOptions.cacheKeyEquals(item.params, params);
    });
    const item = this.cache[itemIndex];
    if (item) {
      if (moment(item.expireTime).isAfter(moment())) {
        return item.data;
      } else {
        this.cache.splice(itemIndex, 1);
        this._saveToStorage();
      }
    }
    return null;
  }
  clear() {
    this.cache = [];
    this._saveToStorage();
  }
}
