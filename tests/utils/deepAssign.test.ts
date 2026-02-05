import { describe, expect, it } from 'vitest';

import { deepAssign } from '../../packages/_utils/deepAssign';

describe('deepAssign', () => {
  it('deeply merges plain objects and overwrites non-objects', () => {
    // `deepAssign` 是一个轻量的“深合并”工具：
    // - 普通对象会递归合并
    // - 数组/原始值会直接覆盖
    const target = { a: { b: 1 }, arr: [1, 2], keep: true };
    const result = deepAssign(target, { a: { c: 2 }, arr: [3], keep: false });

    // 它会原地修改 target，并返回同一个对象引用。
    expect(result).toBe(target);
    expect(target).toEqual({ a: { b: 1, c: 2 }, arr: [3], keep: false });
  });

  it('applies sources left-to-right (later sources win)', () => {
    const target: Record<string, any> = {};
    deepAssign(target, { a: 1, nested: { x: 1 } }, { a: 2 }, { nested: { y: 2 } });
    expect(target).toEqual({ a: 2, nested: { x: 1, y: 2 } });
  });

  it('creates nested objects when needed', () => {
    const target: Record<string, any> = {};
    deepAssign(target, { a: { b: { c: 1 } } });
    expect(target).toEqual({ a: { b: { c: 1 } } });
  });
});
