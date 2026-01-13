import { useCallback, useMemo, useState } from "react";
export type UseCombineControlValueOptions<V> = {
  props: Record<string, any>,
  valueKey?: string,
  defaultValue?: V,
  onChange?: (val: V) => void
}

export type UseCombineControlValueEasyResult<V> = {
  value: V;
  onChange: (nextVal: V) => void;
}


export type UseCombineControlValueResolveResult<V, R extends (...args: any[]) => any> = {
  value: V;
  onChange: (...args: Parameters<R>) => void;
}

export function useCombineControlValue<V>(options: UseCombineControlValueOptions<V>): UseCombineControlValueEasyResult<V>
export function useCombineControlValue<V, R extends (...args: any[]) => any>(options: Omit<UseCombineControlValueOptions<V>, 'onChange'> & {onChange?: (...args: Parameters<R>) => void}, resolveFn: (...args: Parameters<R>) => V): UseCombineControlValueResolveResult<V, R>
/**
 * @param param props 组件属性
 * @param param valueKey 组件值的key，默认value, undefined 被认为是有值，只有当 key 不存在时，转换为非受控模式
 * @param param defaultValue 默认值，当 value 和 defaultValue 同时存在时，以 value 为默认值
 * @param param onChange 值改变时的回调
 * @returns value: 组件应该采用的值，onChange：值改变时的回调，处理非受控值与向父组件传递值的逻辑
 */
export function useCombineControlValue<V>(
  {props, valueKey = 'value', defaultValue, onChange}: UseCombineControlValueOptions<V>,
  resolveFn?: (...args: any[]) => V
) {
  const {[valueKey]: value} = props;
  const hasValue = Object.prototype.hasOwnProperty.call(props, valueKey);

  const [internalValue, setInternalValue] = useState(value ?? defaultValue)

  const handleChange = useCallback((...params: any[]) => {
    let realNextVal;

    if(typeof resolveFn === 'function'){
      realNextVal = resolveFn(...params);
    }else{
      realNextVal = params[0];
    }

    setInternalValue(realNextVal);
    onChange?.(...params);
  }, [onChange, resolveFn])

  const finalValue = useMemo(() => {
    if(hasValue) return value
    return internalValue
  }, [hasValue, internalValue, value])

  return {
    value: finalValue,
    onChange: handleChange
  }
}
