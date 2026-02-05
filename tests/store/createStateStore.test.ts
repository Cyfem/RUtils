import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import createStateStore, { resolveHookState } from '../../packages/store/createStateStore';

describe('createStateStore', () => {
  it('resolves hook state for both initializer and updater functions', () => {
    // `resolveHookState` 是 `setState` 的核心逻辑：
    // - 传入 0 参数函数时，会当作初始化函数（类似 React 的 lazy init）
    // - 传入有参数的函数时，会当作 updater（prevState => nextState）
    expect(resolveHookState(() => 1)).toBe(1);
    expect(resolveHookState((prev: number) => prev + 1, 1)).toBe(2);
    expect(resolveHookState(3, 1)).toBe(3);
  });

  it('updates state and notifies watchers', () => {
    const store = createStateStore(0);

    // `watch` 是给非 React 使用方（或副作用）准备的旁路通知能力。
    // 它应在每次 `set` 时触发，并且支持取消订阅。
    const watcher = vi.fn();
    const close = store.watch(watcher);

    // 直接赋值会更新内部 state，并触发 watcher。
    store.set(1);
    expect(store.get()).toBe(1);
    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenLastCalledWith(1);

    // 函数式更新会收到 prevState（语义与 React 一致）。
    store.set((prev) => prev + 1);
    expect(store.get()).toBe(2);
    expect(watcher).toHaveBeenCalledTimes(2);
    expect(watcher).toHaveBeenLastCalledWith(2);

    // 取消订阅后不再收到后续通知。
    close();
    store.set(3);
    expect(watcher).toHaveBeenCalledTimes(2);
  });

  it('shares state across hook consumers', () => {
    const store = createStateStore(0);

    // 验证“共享 store”行为：
    // 多个 `store.use()` 的消费方应看到同一份 state，并一起更新。
    const hookA = renderHook(() => store.use());
    const hookB = renderHook(() => store.use());

    expect(hookA.result.current[0]).toBe(0);
    expect(hookB.result.current[0]).toBe(0);

    // 通过 store API 更新，应影响所有 hook consumer。
    act(() => {
      store.set(1);
    });
    expect(hookA.result.current[0]).toBe(1);
    expect(hookB.result.current[0]).toBe(1);

    // 通过 hook setter 更新，也应同步更新 store 和其它 consumer。
    act(() => {
      hookA.result.current[1]((prev) => prev + 1);
    });
    expect(hookA.result.current[0]).toBe(2);
    expect(hookB.result.current[0]).toBe(2);

    hookA.unmount();
    hookB.unmount();
  });
});
