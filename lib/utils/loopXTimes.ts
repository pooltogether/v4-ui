export const loopXTimes = (x: number, callback: (index: number) => void) =>
  [...Array(x)].map((_, index) => callback(index))
