import { useState, useEffect, useLayoutEffect } from 'react';
type EffectCallback = () => (void | (() => void));

/**
 * 状态初始化设置器类型
 * 用于延迟初始化状态的函数类型
 */
export type IHookStateInitialSetter<S> = () => S;

/**
 * 状态初始化动作类型
 * 可以是直接的状态值或初始化设置器
 */
export type IHookStateInitAction<S> = S | IHookStateInitialSetter<S>;

/**
 * 状态设置器类型
 * 可以是接收前一个状态的函数或无参数的函数
 */
export type IHookStateSetter<S> = ((prevState: S) => S) | (() => S);

/**
 * 状态设置动作类型
 * 可以是直接的状态值或状态设置器
 */
export type IHookStateSetAction<S> = S | IHookStateSetter<S>;

/**
 * 可解析的状态类型
 * 包含所有可能的状态值或状态设置函数
 */
export type IHookStateResolvable<S> =
  | S
  | IHookStateInitialSetter<S>
  | IHookStateSetter<S>;

  
export function resolveHookState<S>(nextState: IHookStateInitAction<S>): S;
export function resolveHookState<S, C extends S>(
  nextState: IHookStateSetAction<S>,
  currentState: C,
): S;
export function resolveHookState<S, C extends S>(
  nextState: IHookStateResolvable<S>,
  currentState: C,
): S;


export function resolveHookState<S, C extends S>(
  nextState: IHookStateResolvable<S>,
  currentState?: C,
): S {
  if (typeof nextState === 'function') {
    return nextState.length
      ? (nextState as IHookStateSetter<S>)(currentState as C)
      : (nextState as IHookStateInitialSetter<S>)();
  }

  return nextState;
}

/** 判断当前环境是否为浏览器 */
const isBrowser = typeof window !== 'undefined';

/**
 * 只执行一次的 useEffect hook
 * @param effect 要执行的副作用函数
 */
const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};

/**
 * 同构的 useLayoutEffect
 * 在服务端渲染时使用 useEffect，在浏览器环境使用 useLayoutEffect
 */
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

/**
 * 创建状态存储
 * 提供一个简单的状态管理解决方案，支持组件间状态共享
 * 
 * @template S 状态类型
 * @param initialState 初始状态值或初始化函数
 * @returns 包含状态操作方法的对象
 */
export default function createStateStore<S>(initialState?: S) {
  /** 
   * 状态存储对象
   * 包含当前状态、设置状态的方法、状态更新器和监听器列表
   */
  const store: {
    state: S;
    setState: (state: IHookStateSetAction<S>) => void;
    setters: ((state: S) => void)[];
    watchers: ((state: S) => void)[];
  } = {
    state: initialState instanceof Function ? initialState() : initialState,
    setState(nextState: IHookStateSetAction<S>) {
      store.state = resolveHookState(nextState, store.state);
      store.setters.forEach((setter) => setter(store.state));
      store.watchers.forEach((watcher) => watcher(store.state));
    },
    setters: [],
    watchers: [],
  };
  /**
   * 使用状态的 Hook
   * 返回当前状态和更新状态的函数
   * 
   * @returns [当前状态, 状态更新函数]
   */
  const use: () => [S, (state: IHookStateSetAction<S>) => void] = () => {
    // 使用 React 的 useState 创建组件本地状态
    const [globalState, stateSetter] = useState<S>(store.state);

    // 组件卸载时清理状态更新器
    useEffectOnce(() => () => {
      store.setters = store.setters.filter((setter) => setter !== stateSetter);
    });

    // 在组件挂载和更新时注册状态更新器
    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(stateSetter)) {
        store.setters.push(stateSetter);
      }
    });

    return [globalState, store.setState];
  };
  /** 获取当前状态值 */
  const get = () => store.state;
  
  /** 设置状态的函数引用 */
  const set = store.setState;
  
  /**
   * 监听状态变化
   * @param callback 状态变化时的回调函数
   * @returns 取消监听的函数
   */
  const watch = (callback: (state: S) => S | void) => {
    store.watchers.push(callback);
    const close = () => {
      store.watchers = store.watchers.filter((watcher) => watcher !== callback);
    };
    return close;
  };

  return {
    use,
    get,
    set,
    watch,
  };
}