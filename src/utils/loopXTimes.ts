export function loopXTimes<T>(x: number, callback: (index: number) => T) {
  return [...Array(x)].map((_, index) => callback(index))
}
