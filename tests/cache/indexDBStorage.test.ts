import { describe, expect, it } from 'vitest';

import { IndexedDBStorage } from '../../packages/cache/indexDB';

describe('IndexedDBStorage', () => {
  it('stores and retrieves values by key', async () => {
    // 使用 `fake-indexeddb`（在 vitest.setup.ts 中自动注入），因此可在 Node/CI 环境运行。
    const dbName = `test-db-${Math.random().toString(16).slice(2)}`;
    const storage = new IndexedDBStorage(dbName, 'store');

    await storage.setItem('k1', 'v1');
    expect(await storage.getItem('k1')).toBe('v1');
  });

  it('returns undefined for missing keys', async () => {
    const dbName = `test-db-${Math.random().toString(16).slice(2)}`;
    const storage = new IndexedDBStorage(dbName, 'store');

    expect(await storage.getItem('missing')).toBeUndefined();
  });

  it('can be re-opened by a new instance with the same db/store names', async () => {
    const dbName = `test-db-${Math.random().toString(16).slice(2)}`;
    const storage1 = new IndexedDBStorage(dbName, 'store');
    await storage1.setItem('k', { n: 1 });

    // 新实例应能读取到同一个数据库中的数据。
    const storage2 = new IndexedDBStorage(dbName, 'store');
    expect(await storage2.getItem('k')).toEqual({ n: 1 });
  });
});
