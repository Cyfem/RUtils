import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import createStateStore from '../../packages/store/createStateStore';
import { createStoreGetter, createStoreGetterMemo } from '../../packages/store/createGetter';
import {
  createStateStore as createStateStoreFromIndex,
  createStoreGetter as createStoreGetterFromIndex,
  createStoreGetterMemo as createStoreGetterMemoFromIndex,
} from '../../packages/store';

describe('createStoreGetter / createStoreGetterMemo', () => {
  it('is re-exported from the store index', () => {
    expect(createStateStoreFromIndex).toBe(createStateStore);
    expect(createStoreGetterFromIndex).toBe(createStoreGetter);
    expect(createStoreGetterMemoFromIndex).toBe(createStoreGetterMemo);
  });

  it('creates lazy getter properties that always read latest store state', () => {
    // `createStoreGetter` 不是 React Hook，适用于纯 JS 场景。
    // 它通过 getter 属性实现：每次读取属性都会从 `store.get()` 重新计算。
    const store = createStateStore({ first: 'Ada', last: 'Lovelace', age: 18 });
    const getters = {
      fullName: (s: { first: string; last: string }) => `${s.first} ${s.last}`,
      isAdult: (s: { age: number }) => s.age >= 18,
    };
    const maps = { fullName: 'fullName', isAdult: 'isAdult' } as const;

    const g = createStoreGetter(store, getters, maps);

    expect(g.fullName).toBe('Ada Lovelace');
    expect(g.isAdult).toBe(true);

    // 更新 store 后，getter 属性会立即反映最新状态。
    store.set((prev) => ({ ...prev, first: 'Grace', age: 17 }));
    expect(g.fullName).toBe('Grace Lovelace');
    expect(g.isAdult).toBe(false);
  });

  it('creates a memo hook that recomputes derived data when store changes', () => {
    // `createStoreGetterMemo` 是 React 友好的版本。
    // 它把 `store.use()` + `useMemo()` 组合起来，返回一个派生数据对象。
    const store = createStateStore({ a: 1, b: 2 });
    const getters = {
      sum: (s: { a: number; b: number }) => s.a + s.b,
      diff: (s: { a: number; b: number }) => s.a - s.b,
    };
    const maps = { sum: 'sum', diff: 'diff' } as const;

    const useGetters = createStoreGetterMemo(store, getters, maps);
    const hook = renderHook(() => useGetters());

    expect(hook.result.current.sum).toBe(3);
    expect(hook.result.current.diff).toBe(-1);

    // 更新底层 store 后，hook 应重新渲染并产出新的派生值。
    act(() => {
      store.set({ a: 10, b: 3 });
    });
    expect(hook.result.current.sum).toBe(13);
    expect(hook.result.current.diff).toBe(7);

    hook.unmount();
  });
});
