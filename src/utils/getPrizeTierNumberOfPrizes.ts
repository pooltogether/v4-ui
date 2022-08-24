import { calculate, PrizeTier } from '@pooltogether/v4-client-js'

export const getPrizeTierNumberOfPrizes = (prizeTier: PrizeTier) =>
  prizeTier.tiers.map((tier, index) =>
    !!tier ? calculate.calculateNumberOfPrizesForTierIndex(prizeTier.bitRangeSize, index) : 0
  )
