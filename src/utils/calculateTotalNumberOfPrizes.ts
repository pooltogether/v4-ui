import { calculateNumberOfPrizesForIndex, PrizeTier } from '@pooltogether/v4-js-client'

export const calculateTotalNumberOfPrizes = (prizeTier: PrizeTier): number => {
  return prizeTier.tiers.reduce((acc, curr, index) => {
    if (curr) {
      return acc + calculateNumberOfPrizesForIndex(prizeTier.bitRangeSize, index)
    } else {
      return acc
    }
  }, 0)
}
