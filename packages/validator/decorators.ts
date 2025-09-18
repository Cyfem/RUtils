import { BaseValidator } from "./validator";

export function VRequired(noneVals: any[] = [undefined]) {
  return BaseValidator.decoratorCreator((val) => {
    if (noneVals.includes(val)) {
      return false;
    }
    return true;
  });
}

export const VString = BaseValidator.decoratorCreator(
  (val) => {
    
    if (typeof val !== 'string') {
      return false;
    }
    return true;
  },
);

export const VNumber = BaseValidator.decoratorCreator(
  (val) => {
    if (typeof val !== 'number') {
      return false;
    }
    return true;
  },
);

export const VArray = BaseValidator.decoratorCreator(
  (val) => {
    if (!Array.isArray(val)) {
      return false;
    }
    return true;
  },
);
// 常用校验装饰器

export const VBoolean = BaseValidator.decoratorCreator(
  (val) => {
    if (typeof val !== 'boolean') {
      return false;
    }
    return true;
  },
);

export const VMin = (min: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'number' || val < min) {
      return false;
    }
    return true;
  });

export const VMax = (max: number) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'number' || val > max) {
      return false;
    }
    return true;
  });

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

export const VEmail = BaseValidator.decoratorCreator(
  (val) => {
    if (typeof val !== 'string') {
      return false;
    }
    // 简单邮箱正则
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailReg.test(val);
  },
);

export const VPattern = (pattern: RegExp) =>
  BaseValidator.decoratorCreator((val) => {
    if (typeof val !== 'string') {
      return false;
    }
    return pattern.test(val);
  });

