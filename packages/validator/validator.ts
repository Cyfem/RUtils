/**
 * 验证器函数类型，接收任意值并返回验证结果
 * @param val 需要验证的值
 * @returns 包含验证状态和可选错误消息的对象
 */
type Validator = (val: any) => {
  name: string;
  status: boolean;
  message?: string;
};

/**
 * 验证器映射类型，用于存储字段名到验证器数组的映射
 */
type ValidatorMap = {
  [key: string]: Validator[];
};
const KEY_SYMBOL = Symbol("key-description");
/**
 * 基础验证器类
 * 提供字段验证功能，可通过装饰器为类属性添加验证规则
 */
export class BaseValidator {
  /** 用于存储验证器映射的私有符号 */
  private __keySymbol: symbol = KEY_SYMBOL;
  /** 用于存储验证器映射的索引签名 */
  [key: symbol]: ValidatorMap;
  /** 用于存储类属性的索引签名 */
  [key: string]: any;

  /**
   * 构造函数
   * 初始化验证器映射存储
   */
  constructor() {
    this[this.__keySymbol] = {} as ValidatorMap;
  }

  /**
   * 验证单个字段
   * @param itemAll 是否验证所有规则，为true时会验证该字段的所有规则，为false时遇到第一个失败的规则就停止
   * @param itemKey 要验证的字段名
   * @returns 验证错误数组，如果没有错误则返回null
   */
  public validate(
    itemKey: string,
    itemAll: boolean = false
  ): string[] | null {
    const validatorMap = this[this.__keySymbol];
    const errors: string[] = [];
    // 校验每个 key
    const validators = validatorMap[itemKey];
    if (!validators) {
      return null;
    }
    for (const validator of validators) {
      const res = validator(this[itemKey]);
      if (!res.status) {
        errors.push(res.message);
        if (!itemAll) break;
      }
    }
    if (errors.length) {
      return errors;
    }
    return null;
  }

  /**
   * 验证多个或所有字段
   * @param order 验证字段的顺序，可以指定验证的字段名数组及其顺序，默认验证所有字段，按对象定义顺序
   * @param itemAll 是否验证每个字段的所有规则，为true时会验证字段的所有规则，为false时遇到第一个失败的规则就停止，默认为 false
   * @param everyItem 是否验证所有字段，为true时会验证所有字段，为false时遇到第一个失败的字段就停止，默认为 false
   * @returns 验证错误数组，如果没有错误则返回null
   */
  public validateAll(
    order?: string[],
    itemAll: boolean = false,
    everyItem: boolean = false
  ): Record<string, string[]> | null {
    const validatorMap = this[this.__keySymbol];
    const errors: Record<string, string[]> = {};
    // 校验每个 key
    const keys = order || Object.keys(validatorMap);
    for (const key of keys) {
      const value = this[key];
      const fns = validatorMap[key];
      // 校验每个校验项目
      for (const fn of fns) {
        const res = fn(value);
        if (!res.status) {
          // 出现错误
          if (Array.isArray(errors[key])) {
            errors[key].push(res.message);
          } else {
            errors[key] = [res.message];
          }
          if (!itemAll) break;
        }
      }
      if (errors[key] && !everyItem) {
        break;
      }
    }
    if (Object.keys(errors).length) {
      return errors;
    }
    return null;
  }

  /**
   * 装饰器创建器
   * 用于创建属性验证装饰器的工厂函数
   *
   * @param func 验证函数，接收属性值并返回布尔值表示验证结果
   * @returns 返回一个接收错误消息的函数，该函数再返回实际的装饰器
   *
   * @example
   * // 创建一个验证字符串的装饰器
   * const VString = BaseValidator.decoratorCreator(
   *   (val) => typeof val === 'string' || val === undefined
   * );
   *
   * // 创建一个验证必填项的装饰器
   * const VRequired = BaseValidator.decoratorCreator(
   *   (val) => val !== undefined && val !== null && val !== ''
   * );
   *
   * // 在类中使用这些装饰器
   * class User extends BaseValidator {
   *   @VString('名称必须为字符串')
   *   @(VRequired()('名称必须填写'))
   *   name?: string;
   *
   *   // 验证使用
   *   validateName() {
   *     return this.validate('name');
   *   }
   * }
   *
   * const user = new User();
   * console.log(user.validateName()); // 显示错误信息：名称必须填写
   */
  public static decoratorCreator = (
    func: (
      val: any,
      value: undefined,
      context: ClassFieldDecoratorContext<BaseValidator>
    ) => boolean
  ) => {
    return (
      message:
        | ((
            val: any,
            value: undefined,
            context: ClassFieldDecoratorContext<BaseValidator>
          ) => string)
        | string = (val, value, context) => `${String(context.name)}格式错误`
    ) => {
      return function (
        value: undefined,
        context: ClassFieldDecoratorContext<BaseValidator>
      ) {
        context.addInitializer(function () {
          let validators = this[this.__keySymbol];
          if (!validators) {
            this[this.__keySymbol] = {};
            validators = this[this.__keySymbol];
          }
          const name = context.name as string;

          const validator = (val: any) => {
            const validateStatus = func(val, value, context);
            if (validateStatus) {
              return { name, status: true };
            } else {
              let msg: string = "";
              if (typeof message === "function") {
                msg = message(val, value, context);
              } else {
                msg = message;
              }
              return { name, status: false, message: msg };
            }
          };

          if (validators[name]) {
            validators[name] = [...validators[name], validator];
          } else {
            validators[name] = [validator];
          }
        });
      };
    };
  };
}

// class User extends BaseValidator{
//   @VString('名称必须为字符串')
//   @(VRequired()('名称必须填写'))
//   name?: string;

//   @VNumber('年龄必须为数字')
//   @(VRequired()('年龄必须填写'))
//   age?: number;

//   @VEmail('邮箱格式不正确')
//   @(VRequired()('邮箱必须填写'))
//   email?: string;

//   @(VMinLength(6)('密码长度不能少于6位'))
//   @(VRequired()('密码必须填写'))
//   password?: string
// }

// const user = new User();
// user.name = '张三'
// user.email = ' asdfasdf'
// user.password = '12345'
// console.log(user)

// console.log(user.validateAll(false,true,['password','age','email']));
