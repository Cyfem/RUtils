import { useState } from 'react';
import {
  Cache,
  BaseValidator,
  VRequired,
  VString,
  VEmail,
  VMinLength,
  VNumber,
  useCombineControlValue,
} from '../packages';

// Validator Demo - 使用装饰器创建表单验证类
class UserForm extends BaseValidator {
  @VString('名称必须为字符串')
  @VRequired('名称必须填写')
  name?: string;

  @VNumber('年龄必须为数字')
  @VRequired('年龄必须填写')
  age?: number;

  @VEmail('邮箱格式不正确')
  @VRequired('邮箱必须填写')
  email?: string;

  @VMinLength(6)('密码长度不能少于6位')
  @VRequired('密码必须填写')
  password?: string;
}

// 受控/非受控组件 Demo
function ControlledInput(props: { value?: string; onChange?: (val: string) => void }) {
  const { value, onChange } = useCombineControlValue<string>({
    props,
    valueKey: 'value',
    defaultValue: '',
  });

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
    />
  );
}

// Cache Demo
const cache = new Cache<string, string>(undefined, undefined, 30);

export default function App() {
  const [activeTab, setActiveTab] = useState<'validator' | 'cache' | 'hooks'>('validator');

  // Validator Demo State
  const [form] = useState(() => new UserForm());
  const [formData, setFormData] = useState({ name: '', age: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  // Cache Demo State
  const [cacheKey, setCacheKey] = useState('');
  const [cacheValue, setCacheValue] = useState('');
  const [cachedResult, setCachedResult] = useState<string | null>(null);

  // Hooks Demo State
  const [controlledValue, setControlledValue] = useState('controlled value');

  const handleValidate = () => {
    form.name = formData.name;
    form.age = formData.age ? Number(formData.age) : undefined;
    form.email = formData.email;
    form.password = formData.password;
    const result = form.validateAll(undefined, true, true);
    setErrors(result);
  };

  const handleSetCache = () => {
    if (cacheKey && cacheValue) {
      cache.setCache(cacheKey, cacheValue);
      alert(`缓存已设置: ${cacheKey} = ${cacheValue}`);
    }
  };

  const handleGetCache = () => {
    const result = cache.getCache(cacheKey);
    setCachedResult(result);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>RUtils Demo</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {(['validator', 'cache', 'hooks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === tab ? '#007bff' : '#e0e0e0',
              color: activeTab === tab ? '#fff' : '#333',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Validator Demo */}
      {activeTab === 'validator' && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2>Validator Demo</h2>
          <p style={{ color: '#666' }}>使用装饰器进行表单验证</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
              <label>名称:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {errors?.name && <span style={{ color: 'red', marginLeft: '10px' }}>{errors.name[0]}</span>}
            </div>

            <div>
              <label>年龄:</label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {errors?.age && <span style={{ color: 'red', marginLeft: '10px' }}>{errors.age[0]}</span>}
            </div>

            <div>
              <label>邮箱:</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {errors?.email && <span style={{ color: 'red', marginLeft: '10px' }}>{errors.email[0]}</span>}
            </div>

            <div>
              <label>密码:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {errors?.password && <span style={{ color: 'red', marginLeft: '10px' }}>{errors.password[0]}</span>}
            </div>

            <button
              onClick={handleValidate}
              style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}
            >
              验证表单
            </button>

            {errors === null && formData.name && (
              <p style={{ color: 'green' }}>表单验证通过!</p>
            )}
          </div>
        </div>
      )}

      {/* Cache Demo */}
      {activeTab === 'cache' && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2>Cache Demo</h2>
          <p style={{ color: '#666' }}>内存缓存示例 (30秒过期)</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
              <label>Key:</label>
              <input
                type="text"
                value={cacheKey}
                onChange={(e) => setCacheKey(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label>Value:</label>
              <input
                type="text"
                value={cacheValue}
                onChange={(e) => setCacheValue(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSetCache}
                style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                设置缓存
              </button>
              <button
                onClick={handleGetCache}
                style={{ padding: '10px 20px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                获取缓存
              </button>
              <button
                onClick={() => { cache.clear(); setCachedResult(null); }}
                style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                清空缓存
              </button>
            </div>

            {cachedResult !== null && (
              <p>缓存结果: <strong>{cachedResult || '(空)'}</strong></p>
            )}
          </div>
        </div>
      )}

      {/* Hooks Demo */}
      {activeTab === 'hooks' && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2>useCombineControlValue Demo</h2>
          <p style={{ color: '#666' }}>混合受控/非受控组件的 Hook</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div>
              <h3>受控模式</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>父组件传入 value 和 onChange</p>
              <ControlledInput value={controlledValue} onChange={setControlledValue} />
              <p>当前值: {controlledValue}</p>
            </div>

            <div>
              <h3>非受控模式</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>不传入 value，组件自己管理状态</p>
              <ControlledInput />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
