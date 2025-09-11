import createStateStore from "../createStateStore";
import { useMemo } from 'react';

// 定义 getter 函数的类型
export type StoreGetter<S = any> = {
  [K in string]: (store: S) => any
}

// 定义 getter 名称映射的类型
export type GetterNameMap<G extends StoreGetter<any>> = {
  [K in keyof G]: string
}

// 根据 getter 名称映射和 getter 函数推断 reducedData 的类型
export type ReducedData<G extends StoreGetter<any>, M extends GetterNameMap<G>> = {
  [K in keyof M as M[K]]: G[K extends keyof G ? K : never] extends (store: any) => infer R ? R : never
}
/**
 * 创建 store getter
 * @param store store实例
 * @param getters getter函数
 * @param getterNameMaps 将 getter 函数和 getter 名称一一映射
 * @returns getter object
 */
export const createStoreGetter = <S, G extends StoreGetter<S>, M extends GetterNameMap<G>>(
  store: ReturnType<typeof createStateStore<S>>,
  getters: G,
  getterNameMaps: M,
) => {
  const gettersObj = {} as ReducedData<G, M>
  Object.keys(getters).forEach((key) => {
    Object.defineProperty(gettersObj,getterNameMaps[key],{
      get: () => getters[key](store.get())
    })
  })
  return gettersObj
}
/**
 * 
 * @param store store实例
 * @param getters getter函数
 * @param getterNameMaps 将 getter 函数和 getter 名称一一映射
 * @returns getter memo hook
 */
export const createStoreGetterMemo = <
  S,
  G extends StoreGetter<S>,
  M extends GetterNameMap<G>
>(
  store: ReturnType<typeof createStateStore<S>>,
  getters: G,
  getterNameMaps: M,
) => {
  // 创建缓存数据 hook
  return (): ReducedData<G, M> => {
    const [storeData] = store.use()
    const reducedData = useMemo(() => {
      return Object.keys(getters).reduce(
        (acc, key) => {
          const mappedKey = getterNameMaps[key as keyof G] as keyof ReducedData<G, M>
          const getterValue = getters[key as keyof G](storeData)
          acc[mappedKey] = getterValue as any
          return acc
        },
        {} as ReducedData<G, M>,
      )
    }, [storeData])
    return reducedData
  }
}
