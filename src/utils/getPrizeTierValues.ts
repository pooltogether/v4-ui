import { calculate, PrizeTier } from '@pooltogether/v4-utils-js'
import { getAmountFromBigNumber } from './getAmountFromBigNumber'

/**
 * Computes an Amount for every tier
 * @param prizeTier
 * @param decimals
 * @returns
 */
export const getPrizeTierValues = (prizeTier: PrizeTier, decimals: string) =>
  prizeTier.tiers.map((tier, index) =>
    getAmountFromBigNumber(
      calculate.calculatePrizeForTierPercentage(
        index,
        tier,
        prizeTier.bitRangeSize,
        prizeTier.prize
      ),
      decimals
    )
  )
