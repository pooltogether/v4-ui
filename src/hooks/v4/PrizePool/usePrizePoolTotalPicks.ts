import { PrizePool } from '@pooltogether/v4-client-js'
import { getPrizeTierNumberOfPrizes } from '@utils/getPrizeTierNumberOfPrizes'
import { useMemo } from 'react'

import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * NOTE: Assumes only 1 prize distributor per prize pool
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalPicks = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: prizePoolPercentageOfPicks, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  return useMemo(() => {
    if (!isPrizeTierFetched || !isPercentageFetched || !prizeTierData.prizeTier) {
      return {
        data: null,
        isFetched: false
      }
    }
    const numberOfnumberOfPrizesByTier = getPrizeTierNumberOfPrizes(prizeTierData.prizeTier)
    const totalNumberOfPrizes = numberOfnumberOfPrizesByTier.reduce(
      (total, numberOfPrizes) => total + numberOfPrizes,
      0
    )
    return {
      data: totalNumberOfPrizes * prizePoolPercentageOfPicks.percentage,
      isFetched: true
    }
  }, [prizeTierData, prizePoolPercentageOfPicks, isPrizeTierFetched, isPercentageFetched])
}
