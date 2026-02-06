/**
 * 验证器装饰器模块
 * 提供一系列用于数据验证的装饰器，可用于类属性的验证规则定义
 * 这些装饰器基于 BaseValidator 的 decoratorCreator 方法创建
 */
import { BaseValidator } from './validator';

/**
 * 必填项验证装饰器
 * 验证值是否存在且不在指定的无效值列表中
 *
 * @param noneVals 被视为无效的值数组，默认为 [undefined]
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VRequired()('用户名不能为空'))
 *   username?: string;
 * }
 */
export function VRequired(noneVals: any[] = [undefined]) {
  return BaseValidator.decoratorCreator((val) => {
    if (noneVals.includes(val)) {
      return false;
    }
    return true;
  });
}

/**
 * 字符串类型验证装饰器
 * 验证值是否为字符串类型
 *
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @VString('用户名必须为字符串')
 *   username?: string;
 * }
 */
export const VString = BaseValidator.decoratorCreator((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  return true;
});

/**
 * 数字类型验证装饰器
 * 验证值是否为数字类型
 *
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @VNumber('年龄必须为数字')
 *   age?: number;
 * }
 */
export const VNumber = BaseValidator.decoratorCreator((val) => {
  if (typeof val !== 'number') {
    return false;
  }
  return true;
});

/**
 * 数组类型验证装饰器
 * 验证值是否为数组类型
 *
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @VArray('标签必须为数组')
 *   tags?: string[];
 * }
 */
export const VArray = BaseValidator.decoratorCreator((val) => {
  if (!Array.isArray(val)) {
    return false;
  }
  return true;
});

/**
 * 布尔类型验证装饰器
 * 验证值是否为布尔类型
 *
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @VBoolean('状态必须为布尔值')
 *   active?: boolean;
 * }
 */
export const VBoolean = BaseValidator.decoratorCreator((val) => {
  if (typeof val !== 'boolean') {
    return false;
  }
  return true;
});

/**
 * 最小值验证装饰器
 * 验证数字是否大于或等于指定的最小值
 *
 * @param min 最小值
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VMin(18)('年龄必须大于或等于18岁'))
 *   age?: number;
 * }
 */
export const VMin = (min: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'number' || val < min) {
      return false;
    }
    return true;
  });

/**
 * 最大值验证装饰器
 * 验证数字是否小于或等于指定的最大值
 *
 * @param max 最大值
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VMax(120)('年龄必须小于或等于120岁'))
 *   age?: number;
 * }
 */
export const VMax = (max: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'number' || val > max) {
      return false;
    }
    return true;
  });

/**
 * 最小长度验证装饰器
 * 验证字符串或数组的长度是否大于或等于指定的最小长度
 *
 * @param minLen 最小长度
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VMinLength(6)('密码长度不能少于6位'))
 *   password?: string;
 * }
 */
export const VMinLength = (minLen: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'string' && !Array.isArray(val)) {
      return false;
    }
    if (val.length < minLen) {
      return false;
    }
    return true;
  });

/**
 * 最大长度验证装饰器
 * 验证字符串或数组的长度是否小于或等于指定的最大长度
 *
 * @param maxLen 最大长度
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VMaxLength(20)('用户名长度不能超过20位'))
 *   username?: string;
 * }
 */
export const VMaxLength = (maxLen: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'string' && !Array.isArray(val)) {
      return false;
    }
    if (val.length > maxLen) {
      return false;
    }
    return true;
  });

/**
 * 邮箱格式验证装饰器
 * 验证字符串是否符合邮箱格式
 *
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @VEmail('邮箱格式不正确')
 *   email?: string;
 * }
 */
export const VEmail = BaseValidator.decoratorCreator((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  // 简单邮箱正则
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailReg.test(val);
});

/**
 * 正则表达式验证装饰器
 * 验证字符串是否匹配指定的正则表达式模式
 *
 * @param pattern 正则表达式
 * @returns 装饰器工厂函数，可接收自定义错误消息
 *
 * @example
 * class User extends BaseValidator {
 *   @(VPattern(/^1[3-9]\d{9}$/)('手机号格式不正确'))
 *   phone?: string;
 * }
 */
export const VPattern = (pattern: RegExp) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'string') {
      return false;
    }
    return pattern.test(val);
  });
