import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Cache, { StorageMap } from '../../packages/cache';
import { IndexedDBStorage } from '../../packages/cache/indexDB';

describe('Cache', () => {
  it('exposes the expected browser storage mapping', () => {
    // 该映射用于支持持久化缓存模式。
    expect(StorageMap.localStorage).toBe(localStorage);
    expect(StorageMap.sessionStorage).toBe(sessionStorage);
  });

  it('stores and retrieves items in memory (default mode)', () => {
    const cache = new Cache<string, number>();

    cache.setCache('k1', 123, { cacheTime: 60 });
    expect(cache.getCache('k1')).toBe(123);
  });

  it('replaces existing items when cacheKeyEquals considers params equal', () => {
    // 对象参数场景下很关键：你可以按业务主键定义相等性，
    // Cache 会把“同一个 key”当作“同一条缓存项”。
    const cache = new Cache<{ id: number }, string>(
      undefined,
      undefined,
      60,
      '__apiCacheDatabase__',
      (a, b) => a.id === b.id,
    );

    cache.setCache({ id: 1 }, 'v1');
    cache.setCache({ id: 1 }, 'v2');

    expect(cache.cache).toHaveLength(1);
    expect(cache.getCache({ id: 1 })).toBe('v2');
  });

  it('expires items based on expireTime and prunes them on read', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const cache = new Cache<string, number>();
    cache.setCache('k', 1, { cacheTime: 10 });

    // TTL 内仍然有效。
    expect(cache.getCache('k')).toBe(1);

    // 超过 TTL 后会返回 null，并把该项从缓存中移除。
    vi.advanceTimersByTime(11_000);
    expect(cache.getCache('k')).toBeNull();
    expect(cache.cache).toHaveLength(0);

    vi.useRealTimers();
  });

  it('persists to localStorage and restores on new instance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const key = 'cache-localStorage';
    const first = new Cache<string, { v: number }>('localStorage', key, 60);
    first.setCache('k', { v: 1 });

    // 使用相同 key 构造新实例时，应能加载到之前持久化的缓存。
    const second = new Cache<string, { v: number }>('localStorage', key, 60);
    expect(second.getCache('k')).toEqual({ v: 1 });

    vi.useRealTimers();
  });

  it('handles invalid JSON in storage by resetting cache to []', () => {
    const key = 'cache-invalid-json';
    localStorage.setItem(key, '{not-json');

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cache = new Cache<string, number>('localStorage', key, 60);

    // 遇到无效 JSON 时会自愈：清空缓存并用合法的 JSON 数组覆盖存储内容。
    expect(cache.cache).toEqual([]);
    expect(localStorage.getItem(key)).toBe('[]');

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('supports sessionStorage persistence mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const key = 'cache-sessionStorage';
    const cache = new Cache<string, string>('sessionStorage', key, 60);
    cache.setCache('k', 'v');

    const restored = new Cache<string, string>('sessionStorage', key, 60);
    expect(restored.getCache('k')).toBe('v');

    vi.useRealTimers();
  });

  it('can load persisted cache data from indexedDB mode', async () => {
    // 这是“大数据量/异步存储”的持久化缓存选项（IndexedDB）。
    // 这里先往底层 IndexedDB 预写入数据，再验证 Cache 能正确读回。
    const dbName = `cache-db-${Math.random().toString(16).slice(2)}`;
    const key = 'cache-indexeddb';

    const seedStorage = new IndexedDBStorage(dbName, 'cacheStore');
    const expireTime = new Date(Date.now() + 60_000).toISOString();
    await seedStorage.setItem(key, JSON.stringify([{ params: 'k', data: { v: 1 }, expireTime }]));

    const cache = new Cache<string, { v: number }>('indexedDB', key, 60, dbName);

    // `_init` 是异步执行的（构造函数不会 await），因此这里等待其加载完成。
    await waitFor(() => {
      expect(cache.getCache('k')).toEqual({ v: 1 });
    });
  });
});
