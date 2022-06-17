import { PrizePool } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalPicks = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeConfigFetched } = useUpcomingPrizeTier(prizePool)
  const { data: prizePoolPercentageOfPicks, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  if (!isPrizeConfigFetched || !isPercentageFetched || !prizeTierData.prizeTier) {
    return {
      data: null,
      isFetched: false
    }
  }

  const totalNumberOfPrizes = getNumberOfPrizes(
    prizeTierData.prizeTier.tiers,
    prizeTierData.prizeTier.bitRangeSize
  )
  return {
    data: totalNumberOfPrizes * prizePoolPercentageOfPicks,
    isFetched: true
  }
}
