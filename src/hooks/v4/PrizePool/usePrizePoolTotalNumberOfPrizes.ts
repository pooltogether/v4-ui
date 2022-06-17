import { PrizePool } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { useUpcomingPrizeConfig } from '../PrizeDistributor/useUpcomingPrizeConfig'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'

/**
 * Total number of prizes is the percentage of picks given to the supplied prize pool multiplied by the total number of prizes
 * NOTE: Assumes only 1 prize distributor per prize pool
 * TODO: Need to handle TVL changes
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalNumberOfPrizes = (prizePool: PrizePool) => {
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: prizeConfigData, isFetched: isPrizeConfigFetched } =
    useUpcomingPrizeConfig(prizeDistributor)
  const { data: prizePoolPercentageOfPicksData, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  if (!isPrizeConfigFetched || !isPercentageFetched) {
    return {
      data: null,
      isFetched: false
    }
  }

  const totalNumberOfPrizes = getNumberOfPrizes(
    prizeConfigData.prizeConfig.tiers,
    prizeConfigData.prizeConfig.bitRangeSize
  )
  return {
    data: totalNumberOfPrizes * prizePoolPercentageOfPicksData,
    isFetched: true
  }
}
