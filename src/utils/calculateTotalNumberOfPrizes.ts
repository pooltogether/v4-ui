import { calculate, PrizeConfig } from '@pooltogether/v4-client-js'

export const calculateTotalNumberOfPrizes = (prizeConfig: PrizeConfig): number => {
  return prizeConfig.tiers.reduce(
    (totalNumberPrizes: number, currentTier: number, index: number) => {
      if (currentTier === 0) return totalNumberPrizes
      return (
        totalNumberPrizes +
        calculate.calculateNumberOfPrizesForTierIndex(prizeConfig.bitRangeSize, index)
      )
    },
    0
  )
}
