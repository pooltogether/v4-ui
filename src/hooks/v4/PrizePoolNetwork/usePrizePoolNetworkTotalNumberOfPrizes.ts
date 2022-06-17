import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { useAllUpcomingPrizeTiers } from '../PrizePool/useAllUpcomingPrizeTiers'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { useAllPrizePoolTokens } from '../PrizePool/useAllPrizePoolTokens'
import { getPrizePoolPercentageOfPicks } from '../PrizePool/usePrizePoolPercentageOfPicks'
import { usePrizePools } from '../PrizePool/usePrizePools'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'

/**
 * Fetches all TVLs and prize distributions for all prize pools
 * Computes each prize pools percentage of picks and multiplies by the total number of prizes for that distribution
 * @returns
 */
export const usePrizePoolNetworkTotalNumberOfPrizes = () => {
  const prizePools = usePrizePools()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()
  const allTicketTwabTvlQueryResults = useAllPrizePoolTicketTwabTotalSupplies()
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const allUpcomingPrizeTiersQueryResults = useAllUpcomingPrizeTiers()

  const isPrizePoolTokensFetched = allPrizePoolTokensQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  const isTicketTwabTvlsFetched = allTicketTwabTvlQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  const isAllUpcomingPrizeConfigsFetched = allUpcomingPrizeTiersQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  if (
    !isPrizePoolTokensFetched ||
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
    const { data: tokenData } = allPrizePoolTokensQueryResults.find(
      (queryResult) => queryResult.data.prizePoolId === prizePool.id()
    )
    const { data: prizePoolTvl } = allTicketTwabTvlQueryResults.find(
      (queryResult) => queryResult.data.prizePoolId === prizePool.id()
    )
    const percentage = getPrizePoolPercentageOfPicks(
      prizePoolTvl.amount.amount,
      prizePoolNetworkTvl.totalSupply.amount
    )
    const prizeTierQueryResults = allUpcomingPrizeTiersQueryResults.find(
      (queryResult) => queryResult.data.prizePoolId === prizePool.id()
    )

    totalNumberOfPrizes +=
      getNumberOfPrizes(
        prizeTierQueryResults.data.prizeTier.tiers,
        prizeTierQueryResults.data.prizeTier.bitRangeSize
      ) * percentage
  })
  return {
    data: totalNumberOfPrizes,
    isFetched: true
  }
}
