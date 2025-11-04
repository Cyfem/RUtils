import { useCallback, useMemo, useState } from "react";
/**
 * @param param props 组件属性
 * @param param valueKey 组件值的key，默认value, undefined 被认为是有值，只有当 key 不存在时，转换为非受控模式
 * @param param defaultValue 默认值，当 value 和 defaultValue 同时存在时，以 value 为默认值
 * @param param onChange 值改变时的回调
 * @returns value: 组件应该采用的值，onChange：值改变时的回调，处理非受控值与向父组件传递值的逻辑
 */
export const useCombineControlValue = <V>({props, valueKey = 'value', defaultValue, onChange}: {props: Record<string, any>, valueKey?: string, defaultValue?: V, onChange?: (val: V) => void}) => {
  const {[valueKey]: value} = props;
  const hasValue = Object.prototype.hasOwnProperty.call(props, valueKey);

  const [internalValue, setInternalValue] = useState(value ?? defaultValue)
  
  const handleChange = useCallback((nextVal: V) => {
    setInternalValue(nextVal);
    onChange?.(nextVal);
  }, [onChange])

  const finalValue = useMemo(() => {
    if(hasValue) return value
    return internalValue
  }, [hasValue, internalValue, value])

  return {
    value: finalValue,
    onChange: handleChange
  }
}