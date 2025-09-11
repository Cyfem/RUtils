export { createStoreGetter, createStoreGetterMemo } from './createGetter';
export { default as createStateStore } from './createStateStore';

export type { StoreGetter, GetterNameMap, ReducedData } from './createGetter';
export type { IHookStateInitialSetter, IHookStateInitAction, IHookStateSetter, IHookStateSetAction, IHookStateResolvable } from './createStateStore';