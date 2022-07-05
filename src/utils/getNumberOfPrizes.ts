import { calculate } from '@pooltogether/v4-client-js'

export const getNumberOfPrizes = (tiers: number[], bitRangeSize: number) => {
  return tiers.reduce((totalNumberPrizes: number, currentTier: number, index: number) => {
    if (currentTier === 0) return totalNumberPrizes
    return totalNumberPrizes + calculate.calculateNumberOfPrizesForTierIndex(bitRangeSize, index)
  }, 0)
}
