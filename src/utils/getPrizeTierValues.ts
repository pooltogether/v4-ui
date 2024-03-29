import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { calculate, PrizeTierConfig } from '@pooltogether/v4-utils-js'

/**
 * Computes an Amount for every tier
 * @param prizeTier
 * @param decimals
 * @returns
 */
export const getPrizeTierValues = (prizeTier: PrizeTierConfig, decimals: string) =>
  prizeTier.tiers.map((tier, index) =>
    getAmountFromUnformatted(
      calculate.calculatePrizeForTierPercentage(
        index,
        tier,
        prizeTier.bitRangeSize,
        prizeTier.prize
      ),
      decimals
    )
  )
