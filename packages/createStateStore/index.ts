import { useState, EffectCallback, useEffect, useLayoutEffect } from 'react';

export type IHookStateInitialSetter<S> = () => S;
export type IHookStateInitAction<S> = S | IHookStateInitialSetter<S>;

export type IHookStateSetter<S> = ((prevState: S) => S) | (() => S);
export type IHookStateSetAction<S> = S | IHookStateSetter<S>;

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

const isBrowser = typeof window !== 'undefined';

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default function createStateStore<S>(initialState?: S) {
  const store: {
    state: S;
    setState: (state: IHookStateSetAction<S>) => void;
    setters: any[];
    watchers: any[];
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

  const use: () => [S, (state: IHookStateSetAction<S>) => void] = () => {
    const [globalState, stateSetter] = useState<S>(store.state);

    useEffectOnce(() => () => {
      store.setters = store.setters.filter((setter) => setter !== stateSetter);
    });

    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(stateSetter)) {
        store.setters.push(stateSetter);
      }
    });

    return [globalState, store.setState];
  };

  const get = () => store.state;
  const set = store.setState;
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