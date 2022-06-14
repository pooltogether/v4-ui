import { PrizePool } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { useUpcomingPrizeConfig } from '../PrizeDistributor/useUpcomingPrizeConfig'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'

/**
 * NOTE: Assumes only 1 prize distributor per prize pool
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalPicks = (prizePool: PrizePool) => {
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: prizeConfigData, isFetched: isPrizeConfigFetched } =
    useUpcomingPrizeConfig(prizeDistributor)
  const { data: prizePoolPercentageOfPicks, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  if (!isPrizeConfigFetched || !isPercentageFetched || !prizeConfigData.prizeConfig) {
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
    data: totalNumberOfPrizes * prizePoolPercentageOfPicks,
    isFetched: true
  }
}
