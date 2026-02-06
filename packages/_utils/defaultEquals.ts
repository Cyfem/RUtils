/**
 * 默认的相等性比较函数
 * 通过将两个值序列化为 JSON 字符串来比较它们是否相等
 *
 * @template Param 比较值的类型，默认为 any
 * @param prev 前一个值
 * @param next 后一个值
 * @returns {boolean} 如果两个值相等则返回 true，否则返回 false
 *
 * @remarks
 * - 这个函数通过 JSON.stringify 进行比较，适用于大多数简单的数据结构
 * - 不适用于包含函数、undefined、Symbol 等无法序列化的值
 * - 对于循环引用的对象会抛出错误
 */
export default function defaultEquals<Param = any>(prev: Param, next: Param) {
  return JSON.stringify(prev) === JSON.stringify(next);
}
