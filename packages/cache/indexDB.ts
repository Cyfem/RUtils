/**
 * 存储对象接口
 * 定义了 IndexedDB 中存储的对象结构
 */
interface StoredObject {
  /** 存储的键名 */
  key: string;
  /** 存储的值，可以是任意类型 */
  value: any;
}

/**
 * IndexedDB 存储类
 * 提供了对 IndexedDB 数据库操作的简单封装
 */
export class IndexedDBStorage {
  /** 数据库名称 */
  private dbName: string;
  /** 存储对象名称 */
  private storeName: string;
  /** 数据库连接实例 */
  private db: IDBDatabase | null = null;
  /**
   * 构造函数
   * @param dbName 数据库名称
   * @param storeName 存储对象名称
   */
  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * 打开数据库连接
   * 如果数据库不存在则创建新的数据库和存储对象
   * @private
   * @returns Promise<IDBDatabase> 数据库连接实例
   */
  private _open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }
      const request = indexedDB.open(this.dbName);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName, { keyPath: 'key' });
      };

      request.onerror = () => {
        reject(`IndexedDB open request error: ${request.error?.message}`);
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
    });
  }
  /**
   * 获取存储对象
   * @param mode 事务模式，默认为只读模式
   * - readonly: 只读模式
   * - readwrite: 读写模式
   * @private
   * @returns Promise<IDBObjectStore> 存储对象实例
   */
  private _getStore(
    mode: IDBTransactionMode = 'readonly',
  ): Promise<IDBObjectStore> {
    return this._open().then((db) => {
      const transaction = db.transaction(this.storeName, mode);
      return transaction.objectStore(this.storeName);
    });
  }
  /**
   * 设置键值对
   * @param key 键名
   * @param value 要存储的值
   * @returns Promise<void> 存储操作的结果
   * @throws 当存储操作失败时抛出错误
   */
  public setItem<T>(key: string, value: T): Promise<void> {
    return this._getStore('readwrite').then((store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put({ key, value } as StoredObject);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(`Could not set the item: ${request.error?.message}`);
      });
    });
  }
  /**
   * 获取键对应的值
   * @param key 要获取的键名
   * @returns Promise<T> 返回存储的值，如果不存在则返回 undefined
   * @throws 当获取操作失败时抛出错误
   * @template T 存储值的类型，默认为 any
   */
  public getItem<T = any>(key: string): Promise<T> {
    return this._getStore().then((store) => {
      return new Promise<T>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () =>
          resolve(request.result ? request.result.value : undefined);
        request.onerror = () =>
          reject(`Could not get the item: ${request.error?.message}`);
      });
    });
  }
}
