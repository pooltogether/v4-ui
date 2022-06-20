/**
 * Compute the union of several probability distributions
 * p(a | b) = p(a) + p(b) - p(a & b)
 * @param args
 * @returns
 */
export const unionProbabilities = (...args: number[]) => {
  let returnValue = args[0]
  for (let i = 1; i < args.length; i++) {
    returnValue = returnValue + args[i] - returnValue * args[i]
  }
  return returnValue
}
