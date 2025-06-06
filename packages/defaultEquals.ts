
export default function defaultEquals<Param = any>(prev: Param, next: Param) {
  return JSON.stringify(prev) === JSON.stringify(next);
}