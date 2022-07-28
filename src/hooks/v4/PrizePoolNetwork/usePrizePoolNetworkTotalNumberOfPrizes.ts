import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { useAllUpcomingPrizeConfigs } from '../PrizeDistributor/useAllUpcomingPrizeConfigs'
import { usePrizeDistributors } from '../PrizeDistributor/usePrizeDistributors'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { useAllPrizePoolTokens } from '../PrizePool/useAllPrizePoolTokens'
import { getPrizePoolPercentageOfPicks } from '../PrizePool/usePrizePoolPercentageOfPicks'
import { usePrizePools } from '../PrizePool/usePrizePools'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'

/**
 * NOTE: Assumes 1 prize distributor per chain
 * @returns
 */
export const usePrizePoolNetworkTotalNumberOfPrizes = () => {
  const prizePools = usePrizePools()
  const prizeDistributors = usePrizeDistributors()
  const allTicketTwabTvlQueryResults = useAllPrizePoolTicketTwabTotalSupplies()
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const allUpcomingPrizeConfigsQueryResults = useAllUpcomingPrizeConfigs()

  const isTicketTwabTvlsFetched = allTicketTwabTvlQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  const isAllUpcomingPrizeConfigsFetched = allUpcomingPrizeConfigsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  if (
    !isTicketTwabTvlsFetched ||
    !isPrizePoolNetworkTvlFetched ||
    !isAllUpcomingPrizeConfigsFetched
  ) {
    return {
      data: null,
      isFetched: false
    }
  }

  let totalNumberOfPrizes = 0
  prizePools.forEach((prizePool) => {
    const { data: prizePoolTvl } = allTicketTwabTvlQueryResults.find(
      (queryResult) => queryResult.data.prizePoolId === prizePool.id()
    )
    const prizeDistributor = prizeDistributors.find(
      (prizeDistributor) => prizeDistributor.chainId === prizePool.chainId
    )
    const { percentage } = getPrizePoolPercentageOfPicks(
      prizePool,
      prizePoolTvl.amount.amount,
      prizePoolNetworkTvl.totalSupply.amount
    )
    const prizeConfig = allUpcomingPrizeConfigsQueryResults.find(
      (queryResult) => queryResult.data.prizeDistributorId === prizeDistributor.id()
    )

    totalNumberOfPrizes +=
      getNumberOfPrizes(
        prizeConfig.data.prizeConfig.tiers,
        prizeConfig.data.prizeConfig.bitRangeSize
      ) * percentage
  })
  return {
    data: totalNumberOfPrizes,
    isFetched: true
  }
}
