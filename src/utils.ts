export function unique<T>(rawArray: Array<T>): Array<T> {
  return Array.from(new Set(rawArray));
}
