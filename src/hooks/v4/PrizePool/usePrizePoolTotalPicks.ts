import { PrizePool } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * NOTE: Assumes only 1 prize distributor per prize pool
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalPicks = (prizePool: PrizePool) => {
  const { data, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: prizePoolPercentageOfPicks, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  if (!isPrizeTierFetched || !isPercentageFetched || !data.prizeTier) {
    return {
      data: null,
      isFetched: false
    }
  }

  const totalNumberOfPrizes = getNumberOfPrizes(data.prizeTier.tiers, data.prizeTier.bitRangeSize)
  return {
    data: totalNumberOfPrizes * prizePoolPercentageOfPicks.percentage,
    isFetched: true
  }
}
