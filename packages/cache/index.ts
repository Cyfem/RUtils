import moment from 'moment';
import { IndexedDBStorage } from './indexDB';
import defaultEquals from '../defaultEquals';

/**
 * 缓存存储类型
 * - sessionStorage: 会话存储，浏览器关闭后清除
 * - localStorage: 本地存储，永久保存
 * - indexedDB: IndexedDB 数据库存储
 */
export type StorageType = 'sessionStorage' | 'localStorage' | 'indexedDB';

/**
 * 缓存项接口定义
 * 定义了单个缓存项的数据结构
 * 
 * @template Param 缓存参数类型
 * @template Data 缓存数据类型
 */
export interface ICache<Param, Data> {
  /** 
   * 缓存的参数
   * 用于标识和查找缓存项
   */
  params: Param;
  
  /** 
   * 缓存的数据
   * 实际存储的内容
   */
  data: Data;
  
  /** 
   * 过期时间
   * - ISO 8601 格式的字符串
   * - 由 moment().add(cacheTime, 'seconds').toJSON() 生成
   * - 示例：'2025-06-12T10:30:00.000Z'
   */
  expireTime: string;
}

/**
 * 缓存选项接口
 * @template Param 缓存参数类型
 */
export interface ICacheOptions<Param> {
  /** 
   * 存储类型
   * - 'sessionStorage': 会话存储，浏览器关闭后清除
   * - 'localStorage': 本地存储，永久保存
   * - 'indexedDB': IndexedDB 数据库存储
   * - undefined: 仅在内存中缓存（默认值）
   */
  storageType?: StorageType;
  
  /**
   * 缓存键名
   * - 当使用 localStorage/sessionStorage 时必须提供
   * - 用于在存储中标识不同的缓存数据
   * @default undefined 不使用持久化存储
   */
  cacheKey?: string;
  
  /**
   * 缓存时间（秒）
   * - 超过这个时间的缓存项会被自动清除
   * @default 60 一分钟
   */
  cacheTime?: number;
  
  /** 
   * 缓存键比较函数
   * - 用于判断两个缓存参数是否相等
   * - 相等则认为是同一个缓存项
   * @param prev 前一个参数
   * @param next 后一个参数
   * @returns 是否相等
   * @default defaultEquals 使用 JSON.stringify 进行比较
   */
  cacheKeyEquals: (prev: Param, next: Param) => boolean;
  
  /** 
   * IndexedDB 数据库名称
   * - 仅在 storageType 为 'indexedDB' 时使用
   * @default '__apiCacheDatabase__'
   */
  indexDBName?: string;
}

/** 存储类型映射表 */
export const StorageMap: Record<StorageType | string, Storage> = {
  localStorage: localStorage,
  sessionStorage: sessionStorage,
};

/**
 * 缓存类
 * @template Param 缓存参数类型
 * @template Data 缓存数据类型
 */
export default class Cache<Param, Data> {
  /** 内存中的缓存数组 */
  cache: ICache<Param, Data>[] = [];
  /** 缓存选项 */
  private cacheOptions: ICacheOptions<Param>;
  /** 存储实例 */
  storage?: Storage | IndexedDBStorage;  /**
   * 构造函数
   * @param cacheType 存储类型
   * @param cacheKey 缓存键名
   * @param cacheTime 缓存时间（秒）
   * @param indexDBName IndexedDB 数据库名称，默认值为 '__apiCacheDatabase__'
   * @param cacheKeyEquals 缓存键比较函数，默认使用 defaultEquals
   */
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
  /**
   * 初始化缓存
   * 从存储中加载已保存的缓存数据，并进行解析和过期处理
   * @private
   */
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
  }  /**
   * 过滤掉已过期的缓存项
   * 通过比较当前时间和过期时间，移除过期的缓存项
   * @private
   */
  private _filterExpired() {
    const newCache = this.cache.filter((item) => {
      return moment(item.expireTime).isAfter(moment());
    });
    this.cache = newCache;
  }  /**
   * 将当前缓存数据保存到存储中
   * 如果设置了缓存键名且存储实例存在，则将缓存数据序列化后保存
   * @private
   */
  private _saveToStorage() {
    if (this.storage) {
      if (typeof this.cacheOptions.cacheKey === 'string') {
        this.storage.setItem(
          this.cacheOptions.cacheKey,
          JSON.stringify(this.cache),
        );
      }
    }
  }  /**
   * 设置缓存数据
   * @param params 缓存的参数
   * @param data 要缓存的数据
   * @param cacheOptions 可选的缓存配置，可以覆盖默认的缓存时间
   */
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
  }  /**
   * 获取缓存数据
   * @param params 查询参数
   * @returns 如果找到有效的缓存数据则返回数据，否则返回 null
   */
  getCache(params: Param) {
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
  }  /**
   * 清空所有缓存数据
   * 清空内存中的缓存数组并同步到存储中
   */
  clear() {
    this.cache = [];
    this._saveToStorage();
  }
}
