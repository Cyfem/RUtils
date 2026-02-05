import { describe, expect, it } from 'vitest';

import {
  BaseValidator,
  VArray,
  VBoolean,
  VEmail,
  VMax,
  VMaxLength,
  VMin,
  VMinLength,
  VNumber,
  VPattern,
  VRequired,
  VString,
} from '../../packages/validator';

type Initializer = (this: any) => void;

function applyFieldDecorators(
  initializers: Initializer[],
  field: string,
  ...decorators: Array<(value: undefined, context: any) => void>
) {
  for (const decorator of decorators) {
    decorator(undefined, {
      name: field,
      addInitializer(init: Initializer) {
        initializers.push(init);
      },
    });
  }
}

function runInitializers(instance: any, initializers: Initializer[]) {
  for (const init of initializers) init.call(instance);
}

describe('validator (BaseValidator + decorators)', () => {
  it('registers multiple validators per field and validates in order', () => {
    // 该库在运行时使用新版（stage-3）装饰器形态。
    // 为了避免测试里必须写 TS 装饰器语法，这里手动触发装饰器：
    // 1) 通过 `context.addInitializer` 收集 initializer
    // 2) 在实例上执行这些 initializer 完成注册
    class User extends BaseValidator {
      name?: any;
    }

    const initializers: Initializer[] = [];
    applyFieldDecorators(
      initializers,
      'name',
      // 顺序很重要：validator 会按注册顺序执行。
      VRequired([undefined, null, ''])('name is required'),
      VString('name must be a string'),
    );

    const user = new User();
    runInitializers(user, initializers);

    user.name = undefined;
    // validate(key) 默认遇到第一个失败规则就停止。
    expect(user.validate('name')).toEqual(['name is required']);

    // validate(key, true) 会收集该字段所有失败规则的错误。
    expect(user.validate('name', true)).toEqual(['name is required', 'name must be a string']);

    user.name = 'Ada';
    expect(user.validate('name')).toBeNull();
  });

  it('validateAll supports ordering, itemAll (per-field), and everyItem (cross-field)', () => {
    class User extends BaseValidator {
      name?: any;
      age?: any;
    }

    const initializers: Initializer[] = [];
    applyFieldDecorators(initializers, 'name', VRequired()('name required'));
    applyFieldDecorators(
      initializers,
      'age',
      VRequired()('age required'),
      VNumber('age must be number'),
      VMin(18)('age must be >= 18'),
    );

    const user = new User();
    runInitializers(user, initializers);

    user.name = undefined;
    user.age = '17';

    // 默认 validateAll 会在以下位置提前停止：
    // - 遇到第一个有错误的字段就停止（`everyItem=false` 控制）
    // - 对该字段遇到第一个失败规则就停止（`itemAll=false` 控制）
    const firstErrorOnly = user.validateAll(['age', 'name']);
    expect(firstErrorOnly).toEqual({ age: ['age must be number'] });

    // itemAll=true + everyItem=true 会尽可能收集所有字段/所有规则的错误。
    const allErrors = user.validateAll(['age', 'name'], true, true);
    expect(allErrors).toEqual({
      age: ['age must be number', 'age must be >= 18'],
      name: ['name required'],
    });
  });

  it('covers type/shape validators (number/array/boolean/string)', () => {
    class Model extends BaseValidator {
      n?: any;
      arr?: any;
      flag?: any;
      str?: any;
    }

    const initializers: Initializer[] = [];
    applyFieldDecorators(initializers, 'n', VNumber('n must be number'));
    applyFieldDecorators(initializers, 'arr', VArray('arr must be array'));
    applyFieldDecorators(initializers, 'flag', VBoolean('flag must be boolean'));
    applyFieldDecorators(initializers, 'str', VString('str must be string'));

    const m = new Model();
    runInitializers(m, initializers);

    m.n = '1';
    m.arr = {};
    m.flag = 'true';
    m.str = 1;

    expect(m.validateAll(['n', 'arr', 'flag', 'str'], false, true)).toEqual({
      n: ['n must be number'],
      arr: ['arr must be array'],
      flag: ['flag must be boolean'],
      str: ['str must be string'],
    });
  });

  it('covers length/range/pattern/email validators, and shows composing multiple rules', () => {
    class User extends BaseValidator {
      email?: any;
      password?: any;
      tags?: any;
      score?: any;
      phone?: any;
    }

    const initializers: Initializer[] = [];
    applyFieldDecorators(
      initializers,
      'email',
      // 组合示例：必填 + 邮箱格式。
      VRequired()('email required'),
      VEmail('email invalid'),
    );
    applyFieldDecorators(
      initializers,
      'password',
      VMinLength(6)('password too short'),
      VMaxLength(12)('password too long'),
    );
    applyFieldDecorators(initializers, 'tags', VArray('tags must be array'), VMinLength(2)('need >=2 tags'));
    applyFieldDecorators(initializers, 'score', VMin(0)('min 0'), VMax(100)('max 100'));
    applyFieldDecorators(initializers, 'phone', VPattern(/^1[3-9]\d{9}$/)('phone invalid'));

    const user = new User();
    runInitializers(user, initializers);

    user.email = 'not-an-email';
    user.password = '123';
    user.tags = ['only-one'];
    user.score = 101;
    user.phone = '123';

    const errors = user.validateAll(['email', 'password', 'tags', 'score', 'phone'], true, true);
    expect(errors).toEqual({
      email: ['email invalid'],
      password: ['password too short'],
      tags: ['need >=2 tags'],
      score: ['max 100'],
      phone: ['phone invalid'],
    });

    // 修正为合法值，验证“全部通过”的路径。
    user.email = 'a@b.com';
    user.password = '123456';
    user.tags = ['a', 'b'];
    user.score = 100;
    user.phone = '13812345678';
    expect(user.validateAll(['email', 'password', 'tags', 'score', 'phone'], true, true)).toBeNull();
  });

  it('supports message as a function (dynamic message based on value)', () => {
    class Model extends BaseValidator {
      n?: any;
    }

    const initializers: Initializer[] = [];
    applyFieldDecorators(
      initializers,
      'n',
      VNumber((val: any, _value: undefined, ctx: any) => `${String(ctx.name)} got ${String(val)}`),
    );

    const m = new Model();
    runInitializers(m, initializers);

    m.n = 'x';
    expect(m.validate('n')).toEqual(['n got x']);
  });
});
