export function deepAssign(
  target: Record<string, any>,
  ...sources: Record<string, any>[]
): Record<string, any> {
  for (const source of sources) {
    for (const key in source) {
      const val = source[key];

      if (val && typeof val === 'object' && !Array.isArray(val)) {
        target[key] = deepAssign(target[key] || {}, val);
      } else {
        target[key] = val;
      }
    }
  }
  return target;
}
