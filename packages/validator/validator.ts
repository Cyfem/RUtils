type Validator = (val: any) => { status: boolean; message?: string };
type ValidatorMap = {
  [key: string]: Validator[];
};

export class BaseValidator {

  private __keySymbol: symbol = Symbol('key-description');
  [key: symbol]: ValidatorMap;
  [key: string]: any;

  constructor() {
    this.__keySymbol = Symbol('key-description');
    this[this.__keySymbol] = {} as ValidatorMap;
  }

  validate(itemKey: string, itemAll: boolean = false) {
    const validatorMap = this[this.__keySymbol]
    const errors: ReturnType<Validator>[] = [];
    // 校验每个 key
    const validators = validatorMap[itemKey];
    if (!validators) {
      return errors;
    }
    for(const validator of validators){
      const res = validator(this[itemKey]);
      if(!res.status){
        errors.push(res);
        if(!itemAll) break;
      }
    }
    if(errors.length){
      return errors;
    }
    return null;
  }
  
  validateAll(itemAll: boolean = false, everyItem: boolean = false, order?: string[]) {
    const validatorMap = this[this.__keySymbol]
    const errors: ReturnType<Validator>[] = [];
    // 校验每个 key
    const keys = order || Object.keys(validatorMap);
    for (const key of keys) {
      
      const value = this[key];
      const fns = validatorMap[key];
      // 校验每个校验项目
      for (const fn of fns) {
        const res = fn(value);
        if (!res.status) {
          errors.push(res);
          if (!itemAll) break;
        }
      }
      if (!everyItem) {
        break;
      }
    }
    if(errors.length){
      return errors;
    }
    return null;
  }

  static decoratorCreator = (
    func: (val: any, value: undefined, context: ClassFieldDecoratorContext<BaseValidator>) => boolean,
  ) => {
    return (message: ((val: any, value: undefined, context: ClassFieldDecoratorContext<BaseValidator>) => string) | string  = (val,value,context) => `${String(context.name)}格式错误`) => {
      return function (value: undefined, context: ClassFieldDecoratorContext<BaseValidator>) {
        context.addInitializer(function() {
    
          let validators = this[this.__keySymbol];
          if(!validators){
            this[this.__keySymbol] = {}
            validators = this[this.__keySymbol];
          }
          const name = context.name as string;
    
          const validator = (val: any) => {
            const validateStatus = func(val, value, context);
            if(validateStatus){
              return {status:true}
            }else{
              let msg:string = '';
              if(typeof message === 'function'){
                msg = message(val,value,context);
              }else{
                msg = message
              }
              return { status: false,message: msg }
            }
          };
          
          if (validators[name]) {
            validators[name] = [...validators[name], validator];
          } else {
            validators[name] = [validator];
          }
        })
      }
    }
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
