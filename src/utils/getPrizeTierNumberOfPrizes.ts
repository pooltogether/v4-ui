import { calculate, PrizeTierConfig } from '@pooltogether/v4-client-js'

export const getPrizeTierNumberOfPrizes = (prizeTier: PrizeTierConfig) =>
  prizeTier.tiers.map((tier, index) =>
    !!tier ? calculate.calculateNumberOfPrizesForTierIndex(prizeTier.bitRangeSize, index) : 0
  )
