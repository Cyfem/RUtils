import { describe, expect, it } from 'vitest';

import defaultEquals from '../../packages/_utils/defaultEquals';

describe('defaultEquals', () => {
  it('compares values by JSON.stringify (simple deep-ish equality)', () => {
    // 这是 Cache / Request 缓存逻辑使用的默认比较器。
    expect(defaultEquals(1, 1)).toBe(true);
    expect(defaultEquals('a', 'a')).toBe(true);
    expect(defaultEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(defaultEquals([1, 2], [1, 2])).toBe(true);

    expect(defaultEquals({ a: 1 }, { a: 2 })).toBe(false);
    expect(defaultEquals([1, 2], [2, 1])).toBe(false);
  });

  it('does not consider different key insertion orders equal', () => {
    // JSON.stringify 会保留属性插入顺序，因此语义相同的对象也可能比较为 false。
    // 这个测试用来记录该限制，避免使用时产生误解。
    expect(defaultEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false);
  });

  it('throws on circular structures (documented limitation)', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    expect(() => defaultEquals(obj, obj)).toThrow();
  });
});
