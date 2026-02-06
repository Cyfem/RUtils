import React, { useState } from 'react';
import {
  BaseValidator,
  VRequired,
  VString,
  VNumber,
  VEmail,
  VMinLength,
  VMaxLength,
  VMin,
  VMax,
  VPattern,
} from 'rxtutils';
import { CodeBlock } from './CodeBlock';

const VALIDATOR_CODE = `
import {
  BaseValidator,
  VRequired,
  VString,
  VNumber,
  VEmail,
  VMinLength,
  VMaxLength,
  VMin,
  VMax,
  VPattern
} from 'rxtutils';

// 定义验证类
class UserValidator extends BaseValidator {
  @VString('用户名必须为字符串')
  @(VRequired()('用户名不能为空'))
  @(VMinLength(3)('用户名至少3个字符'))
  @(VMaxLength(20)('用户名最多20个字符'))
  username?: string;

  @VString('邮箱必须为字符串')
  @(VRequired()('邮箱不能为空'))
  @VEmail('邮箱格式不正确')
  email?: string;

  @VNumber('年龄必须为数字')
  @(VRequired()('年龄不能为空'))
  @(VMin(18)('年龄必须大于或等于18岁'))
  @(VMax(120)('年龄必须小于或等于120岁'))
  age?: number;

  @(VPattern(/^1[3-9]\d{9}$/)('手机号格式不正确'))
  phone?: string;
}

// 使用验证器
const user = new UserValidator();
user.username = 'John';
user.email = 'john@example.com';
user.age = 25;

// 验证单个字段
const errors = user.validate('username');

// 验证所有字段
const allErrors = user.validateAll();

// 验证所有字段，包括所有错误
const allErrorsFull = user.validateAll(undefined, true, true);
`;

// 创建用户验证类
class UserValidator extends BaseValidator {
  @VString('用户名必须为字符串')
  @(VRequired()('用户名不能为空'))
  @(VMinLength(3)('用户名至少3个字符'))
  @(VMaxLength(20)('用户名最多20个字符'))
  username?: string;

  @VString('邮箱必须为字符串')
  @(VRequired()('邮箱不能为空'))
  @VEmail('邮箱格式不正确')
  email?: string;

  @VNumber('年龄必须为数字')
  @(VRequired()('年龄不能为空'))
  @(VMin(18)('年龄必须大于或等于18岁'))
  @(VMax(120)('年龄必须小于或等于120岁'))
  age?: number;

  @(VPattern(/^1[3-9]\d{9}$/)('手机号格式不正确'))
  phone?: string;
}

export const ValidatorExample: React.FC = () => {
  const [user] = useState(() => new UserValidator());
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[] | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    (user as any)[field] = value;
    if (activeField === field) {
      const errors = user.validate(field);
      setFieldErrors(errors);
    }
  };

  const handleValidateField = (field: string) => {
    setActiveField(field);
    const errors = user.validate(field);
    setFieldErrors(errors);
    setValidationErrors(null);
  };

  const handleValidateAll = (showAllErrors: boolean = false) => {
    const errors = user.validateAll(undefined, showAllErrors, true);
    setValidationErrors(errors);
    setFieldErrors(null);
    setActiveField(null);
  };

  const getValidationErrorClass = (field: string) => {
    if (fieldErrors && activeField === field) {
      return 'input-error';
    }
    if (validationErrors && validationErrors[field]) {
      return 'input-error';
    }
    return '';
  };

  const getFieldErrors = (field: string) => {
    if (fieldErrors && activeField === field) {
      return fieldErrors;
    }
    if (validationErrors && validationErrors[field]) {
      return validationErrors[field];
    }
    return null;
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Validator 表单验证</h2>
        <p className="description">
          RUtils 提供了一个基于装饰器的表单验证方案。通过扩展 <code>BaseValidator</code> 类
          并使用各种验证装饰器，可以轻松定义验证规则。
        </p>

        <CodeBlock code={VALIDATOR_CODE} title="使用示例" />
      </div>

      <div className="card">
        <h2>用户表单</h2>
        <p className="description">填写以下表单字段，然后点击验证按钮查看验证结果。</p>

        <div className="form-group">
          <label className="label">用户名 *</label>
          <input
            type="text"
            className={`input ${getValidationErrorClass('username')}`}
            placeholder="请输入用户名（3-20字符）"
            onChange={(e) => handleFieldChange('username', e.target.value)}
          />
          {getFieldErrors('username') && (
            <div className="error" style={{ marginTop: '8px' }}>
              {getFieldErrors('username')!.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              className="button button-secondary"
              onClick={() => handleValidateField('username')}
            >
              验证此字段
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="label">邮箱 *</label>
          <input
            type="email"
            className={`input ${getValidationErrorClass('email')}`}
            placeholder="请输入邮箱地址"
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
          {getFieldErrors('email') && (
            <div className="error" style={{ marginTop: '8px' }}>
              {getFieldErrors('email')!.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              className="button button-secondary"
              onClick={() => handleValidateField('email')}
            >
              验证此字段
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="label">年龄 *</label>
          <input
            type="number"
            className={`input ${getValidationErrorClass('age')}`}
            placeholder="请输入年龄（18-120）"
            min={18}
            max={120}
            onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || undefined)}
          />
          {getFieldErrors('age') && (
            <div className="error" style={{ marginTop: '8px' }}>
              {getFieldErrors('age')!.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button className="button button-secondary" onClick={() => handleValidateField('age')}>
              验证此字段
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="label">手机号</label>
          <input
            type="text"
            className={`input ${getValidationErrorClass('phone')}`}
            placeholder="请输入手机号"
            onChange={(e) => handleFieldChange('phone', e.target.value)}
          />
          {getFieldErrors('phone') && (
            <div className="error" style={{ marginTop: '8px' }}>
              {getFieldErrors('phone')!.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              className="button button-secondary"
              onClick={() => handleValidateField('phone')}
            >
              验证此字段
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="button button-primary" onClick={() => handleValidateAll(false)}>
            验证所有字段（首个错误）
          </button>
          <button className="button button-primary" onClick={() => handleValidateAll(true)}>
            验证所有字段（显示所有错误）
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              (user as any).username = undefined;
              (user as any).email = undefined;
              (user as any).age = undefined;
              (user as any).phone = undefined;
              setValidationErrors(null);
              setFieldErrors(null);
              setActiveField(null);
            }}
          >
            重置表单
          </button>
        </div>
      </div>

      {validationErrors && (
        <div className="card">
          <h2>验证结果</h2>
          {Object.keys(validationErrors).length === 0 ? (
            <div className="success">所有字段验证通过！</div>
          ) : (
            <div>
              {Object.entries(validationErrors).map(([field, errors]) => (
                <div key={field} style={{ marginBottom: '12px' }}>
                  <strong>{field}:</strong>
                  <div className="error" style={{ marginTop: '4px' }}>
                    {errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>当前表单数据</h2>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
          }}
        >
          {JSON.stringify(
            {
              username: user.username,
              email: user.email,
              age: user.age,
              phone: user.phone,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="card">
        <h2>可用的验证装饰器</h2>
        <div className="grid grid-2">
          <div>
            <h3>基础类型验证</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>
                <code>VRequired</code> - 必填项验证
              </li>
              <li>
                <code>VString</code> - 字符串类型
              </li>
              <li>
                <code>VNumber</code> - 数字类型
              </li>
              <li>
                <code>VArray</code> - 数组类型
              </li>
              <li>
                <code>VBoolean</code> - 布尔类型
              </li>
            </ul>
          </div>
          <div>
            <h3>约束验证</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>
                <code>VMin</code> - 最小值
              </li>
              <li>
                <code>VMax</code> - 最大值
              </li>
              <li>
                <code>VMinLength</code> - 最小长度
              </li>
              <li>
                <code>VMaxLength</code> - 最大长度
              </li>
              <li>
                <code>VEmail</code> - 邮箱格式
              </li>
              <li>
                <code>VPattern</code> - 正则表达式
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
