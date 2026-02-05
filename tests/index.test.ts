import { describe, expect, it } from 'vitest';

import * as R from '../packages';

describe('packages/index (public exports)', () => {
  it('exports all main entry points', () => {
    // 该测试用于保护库的“对外导出 API 面”。
    // 一旦导出名被意外改动，使用方会直接破坏性报错。
    expect(typeof R.Cache).toBe('function');
    expect(typeof R.createBaseRequest).toBe('function');
    expect(typeof R.createStateStore).toBe('function');
    expect(typeof R.createStoreGetter).toBe('function');
    expect(typeof R.createStoreGetterMemo).toBe('function');
    expect(typeof R.useCombineControlValue).toBe('function');
    expect(typeof R.downloadBlob).toBe('function');

    expect(typeof R.BaseValidator).toBe('function');
    expect(typeof R.VRequired).toBe('function');
    expect(typeof R.VString).toBe('function');
    expect(typeof R.VNumber).toBe('function');
    expect(typeof R.VEmail).toBe('function');
    expect(typeof R.VMinLength).toBe('function');
    expect(typeof R.VMaxLength).toBe('function');
    expect(typeof R.VArray).toBe('function');
    expect(typeof R.VBoolean).toBe('function');
    expect(typeof R.VPattern).toBe('function');
    expect(typeof R.VMin).toBe('function');
    expect(typeof R.VMax).toBe('function');
  });

  it('can use Cache through the top-level export', () => {
    const cache = new R.Cache<string, number>();
    cache.setCache('k', 1, { cacheTime: 60 });
    expect(cache.getCache('k')).toBe(1);
  });
});
