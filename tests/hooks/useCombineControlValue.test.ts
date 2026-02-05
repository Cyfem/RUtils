import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCombineControlValue } from '../../packages/hooks/useCombineControlValue';
import { useCombineControlValue as useCombineControlValueFromIndex } from '../../packages/hooks';

describe('useCombineControlValue', () => {
  it('is re-exported from the hooks index', () => {
    // 保护对外 API：使用方常从 `rxtutils/hooks` 导入。
    expect(useCombineControlValueFromIndex).toBe(useCombineControlValue);
  });

  it('works in uncontrolled mode (when the value key is not present)', () => {
    // 非受控模式：`props` 中不存在该 key（默认是 "value"），
    // 因此 hook 会用 `defaultValue` 初始化并维护内部状态。
    const onChange = vi.fn();
    const hook = renderHook(() =>
      useCombineControlValue<number>({
        props: {},
        defaultValue: 1,
        onChange,
      }),
    );

    expect(hook.result.current.value).toBe(1);

    act(() => {
      hook.result.current.onChange(2);
    });

    // 内部值会更新，同时会触发回调通知。
    expect(hook.result.current.value).toBe(2);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('works in controlled mode (hasOwnProperty decides the mode)', () => {
    // 受控模式：只要 `props.value` 这个 key 存在（即使值为 undefined）就会进入受控模式。
    // 在该模式下，返回的 value 始终以 `props.value` 为准，内部 state 会被忽略。
    const onChange = vi.fn();
    const hook = renderHook(
      ({ value }: { value: number }) =>
        useCombineControlValue<number>({
          props: { value },
          defaultValue: 0,
          onChange,
        }),
      { initialProps: { value: 5 } },
    );

    expect(hook.result.current.value).toBe(5);

    act(() => {
      hook.result.current.onChange(6);
    });

    // 仍然是 5，因为处于受控模式；需要父组件更新 props 才会变化。
    expect(hook.result.current.value).toBe(5);
    expect(onChange).toHaveBeenCalledWith(6);

    hook.rerender({ value: 6 });
    expect(hook.result.current.value).toBe(6);
  });

  it('treats an explicitly provided `value: undefined` as controlled', () => {
    // 对应源码注释：“undefined 被认为是有值，只有当 key 不存在时，转换为非受控模式”。
    const hook = renderHook(() =>
      useCombineControlValue<number>({
        props: { value: undefined },
        defaultValue: 123,
      }),
    );

    expect(hook.result.current.value).toBeUndefined();
  });

  it('supports custom valueKey (e.g. `checked`)', () => {
    const hook = renderHook(
      ({ checked }: { checked?: boolean }) =>
        useCombineControlValue<boolean>({
          props: { checked },
          valueKey: 'checked',
          defaultValue: false,
        }),
      { initialProps: { checked: true } },
    );

    expect(hook.result.current.value).toBe(true);

    hook.rerender({ checked: false });
    expect(hook.result.current.value).toBe(false);
  });

  it('supports resolveFn to derive the next value from complex onChange args', () => {
    // 有些组件的 onChange 形态是 onChange(event) 而不是 onChange(value)。
    // `resolveFn` 可以把这些参数映射成内部真正需要写入的 next value。
    const onChange = vi.fn<(event: { target: { value: string } }) => void>();
    const hook = renderHook(() =>
      useCombineControlValue<number, (event: { target: { value: string } }) => void>(
        { props: {}, defaultValue: 0, onChange },
        (event) => Number(event.target.value),
      ),
    );

    act(() => {
      hook.result.current.onChange({ target: { value: '42' } });
    });

    expect(hook.result.current.value).toBe(42);
    // 注意：传给父组件的回调参数仍然是原始的 onChange 参数。
    expect(onChange).toHaveBeenCalledWith({ target: { value: '42' } });
  });
});
