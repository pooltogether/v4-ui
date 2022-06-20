import { PrizePool } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * Total number of prizes is the percentage of picks given to the supplied prize pool multiplied by the total number of prizes
 * TODO: Need to handle TVL changes
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalNumberOfPrizes = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: prizePoolPercentageOfPicksData, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  if (!isPrizeTierFetched || !isPercentageFetched) {
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
    data: totalNumberOfPrizes * prizePoolPercentageOfPicksData,
    isFetched: true
  }
}
