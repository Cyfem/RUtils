/**
 * 导出主要功能模块
 */
/** 缓存管理模块 */
export { default as Cache } from './cache';
/** HTTP 请求创建模块 */
export { default as createBaseRequest } from './request';
/** 状态管理模块 */
export { createStateStore } from './store';
export { createStoreGetter, createStoreGetterMemo } from './store';

export { BaseValidator } from "./validator";
export { VRequired, VString, VNumber, VEmail, VMinLength, VArray, VBoolean, VPattern, VMaxLength, VMax, VMin } from './validator';

/**
 * 缓存模块类型导出
 * 包含缓存接口、配置选项、存储映射和存储类型
 */
export type { ICache, ICacheOptions, StorageMap, StorageType } from './cache';

/**
 * 请求模块类型导出
 * 包含错误处理、请求选项和错误类型
 */
export type {
  ErrorHandlerReturnType,
  Options,
  RequestOptions,
  RequestError,
  RequestErrorType,
} from './request';

/**
 * 状态管理模块类型导出
 * 包含状态初始化、设置和更新的类型定义
 */
export type { 
  IHookStateInitialSetter,
  IHookStateInitAction,
  IHookStateSetter,
  IHookStateSetAction,
  IHookStateResolvable
} from './store';

