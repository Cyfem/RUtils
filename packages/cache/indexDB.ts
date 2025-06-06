interface StoredObject {
  key: string;
  value: any;
}

// IndexedDB的简易封装类
export class IndexedDBStorage {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  // 打开数据库连接
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

  // 获取存储对象
  private _getStore(
    mode: IDBTransactionMode = 'readonly',
  ): Promise<IDBObjectStore> {
    return this._open().then((db) => {
      const transaction = db.transaction(this.storeName, mode);
      return transaction.objectStore(this.storeName);
    });
  }

  // 设置键值对
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

  // 获取键对应的值
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
