import React, { useState } from 'react';
import { useCombineControlValue } from 'rxtutils';
import { CodeBlock } from './CodeBlock';

const HOOKS_CODE = `
import { useCombineControlValue } from 'rxtutils';

// 受控模式（父组件控制值）
function ControlledInput({ value, onChange }) {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue({
    props: { value, onChange },
  });

  return (
    <input
      value={finalValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}

// 非受控模式（组件自己管理值）
function UncontrolledInput({ onChange }) {
  const { value, onChange: handleChange } = useCombineControlValue({
    props: { onChange },
    defaultValue: 'default value',
  });

  return (
    <input
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}

// 带 defaultValue 的受控模式
function MixedInput({ value, onChange, defaultValue }) {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue({
    props: { value, onChange },
    defaultValue,
  });

  return (
    <input
      value={finalValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}

// 使用 resolveFn 处理事件参数
function NumberInput({ value, onChange }) {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue(
    {
      props: { value, onChange },
      defaultValue: 0,
    },
    (e) => parseInt(e.target.value, 10)
  );

  return (
    <input
      type="number"
      value={finalValue}
      onChange={handleChange}
    />
  );
}
`;

// 受控输入组件
const ControlledInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({
  value,
  onChange,
}) => {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue({
    props: { value, onChange },
  });

  return (
    <input
      type="text"
      className="input"
      value={finalValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="受控模式输入"
    />
  );
};

// 非受控输入组件
const UncontrolledInput: React.FC<{ onChange?: (val: string) => void }> = ({
  onChange,
}) => {
  const { value, onChange: handleChange } = useCombineControlValue({
    props: { onChange },
    onChange,
    defaultValue: '默认值',
  });

  return (
    <input
      type="text"
      className="input"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="非受控模式输入"
    />
  );
};

// 混合模式输入组件
const MixedInput: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  defaultValue?: string;
}> = ({ value, onChange, defaultValue = '混合模式默认值' }) => {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue({
    props: { value, onChange },
    defaultValue,
  });

  return (
    <input
      type="text"
      className="input"
      value={finalValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="混合模式输入"
    />
  );
};

// 数字输入组件（使用 resolveFn）
const NumberInput: React.FC<{
  value?: number;
  onChange?: (val: number) => void;
}> = ({ value, onChange }) => {
  const { value: finalValue, onChange: handleChange } = useCombineControlValue(
    {
      props: { value, onChange },
      defaultValue: 0,
    },
    (e: React.ChangeEvent<HTMLInputElement>) => parseInt(e.target.value, 10)
  );

  return (
    <input
      type="number"
      className="input"
      value={finalValue}
      onChange={handleChange}
      placeholder="数字输入"
    />
  );
};

export const HooksExample: React.FC = () => {
  const [controlledValue, setControlledValue] = useState('');
  const [uncontrolledOnChangeValue, setUncontrolledOnChangeValue] = useState('');
  const [mixedValue, setMixedValue] = useState('');
  const [numberValue, setNumberValue] = useState(0);

  return (
    <div className="container">
      <div className="card">
        <h2>Hooks - useCombineControlValue</h2>
        <p className="description">
          <code>useCombineControlValue</code> 是一个强大的 Hook，用于统一处理受控和非受控组件模式。
          它会根据 props 是否传递 <code>value</code> 来决定使用哪种模式。
        </p>

        <CodeBlock code={HOOKS_CODE} title="使用示例" />
      </div>

      <div className="card">
        <h2>使用场景说明</h2>
        <div className="grid grid-2">
          <div>
            <h3>受控模式</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              当父组件传递 <code>value</code> prop 时，使用受控模式。
              父组件完全控制输入值。
            </p>
          </div>
          <div>
            <h3>非受控模式</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              当父组件不传递 <code>value</code> prop 时，使用非受控模式。
              组件内部使用 <code>defaultValue</code> 管理状态。
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>1. 受控模式示例</h2>
        <p className="description">
          父组件传递 <code>value</code>，完全控制输入值。
          当前值由父组件状态管理。
        </p>

        <div className="form-group">
          <label className="label">受控输入</label>
          <ControlledInput
            value={controlledValue}
            onChange={setControlledValue}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <strong>当前值：</strong>
          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            {controlledValue || '(空)'}
          </code>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            className="button button-secondary"
            onClick={() => setControlledValue('Hello World')}
          >
            设置为 "Hello World"
          </button>
          <button
            className="button button-secondary"
            onClick={() => setControlledValue('')}
          >
            清空
          </button>
        </div>
      </div>

      <div className="card">
        <h2>2. 非受控模式示例</h2>
        <p className="description">
          父组件不传递 <code>value</code>，组件自己管理状态。
          使用 <code>defaultValue</code> 设置初始值。
        </p>

        <div className="form-group">
          <label className="label">非受控输入</label>
          <UncontrolledInput onChange={(v) => {console.log('v', v); setUncontrolledOnChangeValue(v)}} />
        </div>

        <div style={{ marginTop: '16px' }}>
          <strong>父组件接收到的值：</strong>
          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            {uncontrolledOnChangeValue || '(未变化)'}
          </code>
        </div>

        <div className="info" style={{ marginTop: '12px' }}>
          组件自己管理状态，默认值为 "默认值"。父组件只能通过 onChange 接收值的变化，
          无法直接控制组件的值。
        </div>
      </div>

      <div className="card">
        <h2>3. 混合模式示例</h2>
        <p className="description">
          当传递 <code>value</code> 时使用受控模式，否则使用 <code>defaultValue</code> 的非受控模式。
        </p>

        <div className="form-group">
          <label className="label">混合输入</label>
          <MixedInput
            value={mixedValue || undefined}
            onChange={setMixedValue}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <strong>当前值：</strong>
          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            {mixedValue || '(非受控模式，使用默认值)'}
          </code>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            className="button button-secondary"
            onClick={() => setMixedValue('受控模式')}
          >
            切换到受控模式
          </button>
          <button
            className="button button-secondary"
            onClick={() => setMixedValue('')}
          >
            切换到非受控模式
          </button>
        </div>
      </div>

      <div className="card">
        <h2>4. 使用 resolveFn 示例</h2>
        <p className="description">
          使用 <code>resolveFn</code> 处理事件参数，例如从 change 事件中提取数字值。
        </p>

        <div className="form-group">
          <label className="label">数字输入</label>
          <NumberInput value={numberValue} onChange={setNumberValue} />
        </div>

        <div style={{ marginTop: '16px' }}>
          <strong>当前值：</strong>
          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            {numberValue}
          </code>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            className="button button-secondary"
            onClick={() => setNumberValue(numberValue + 10)}
          >
            +10
          </button>
          <button
            className="button button-secondary"
            onClick={() => setNumberValue(Math.max(0, numberValue - 10))}
          >
            -10
          </button>
          <button
            className="button button-danger"
            onClick={() => setNumberValue(0)}
          >
            重置为 0
          </button>
        </div>

        <div className="info" style={{ marginTop: '12px' }}>
          resolveFn 允许你将事件对象转换为实际需要的值类型。
          这里我们将 React.ChangeEvent 转换为数字类型。
        </div>
      </div>

      <div className="card">
        <h2>API 说明</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>函数签名：</strong>
          </div>
          <pre style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
          }}>
{`useCombineControlValue<V>(options: {
  props: Record<string, any>,
  valueKey?: string,      // 默认 'value'
  defaultValue?: V,       // 非受控模式下的默认值
  onChange?: (val: V) => void
}): {
  value: V,
  onChange: (nextVal: V) => void
}

// 或使用 resolveFn
useCombineControlValue<V, R extends (...args: any[]) => any>(
  options: Omit<UseCombineControlValueOptions<V>, 'onChange'> & {
    onChange?: (...args: Parameters<R>) => void
  },
  resolveFn: (...args: Parameters<R>) => V
): {
  value: V,
  onChange: (...args: Parameters<R>) => void
}`}
          </pre>

          <div style={{ marginTop: '16px' }}>
            <strong>参数说明：</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li><code>props</code> - 组件的 props 对象</li>
              <li><code>valueKey</code> - 值的属性名，默认为 'value'</li>
              <li><code>defaultValue</code> - 非受控模式下的默认值</li>
              <li><code>onChange</code> - 值变化时的回调</li>
              <li><code>resolveFn</code> - 可选，用于转换 onChange 参数</li>
            </ul>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>返回值：</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li><code>value</code> - 组件应该使用的值</li>
              <li><code>onChange</code> - 值变化时的处理器</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
