import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { useAllUpcomingPrizeTiers } from '../PrizePool/useAllUpcomingPrizeTiers'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { useAllPrizePoolTokens } from '../PrizePool/useAllPrizePoolTokens'
import { getPrizePoolPercentageOfPicks } from '../PrizePool/usePrizePoolPercentageOfPicks'
import { usePrizePools } from '../PrizePool/usePrizePools'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'
import { useQuery } from 'react-query'
import { NO_REFETCH } from '@constants/query'

/**
 * Fetches all TVLs and prize distributions for all prize pools
 * Computes each prize pools percentage of picks and multiplies by the total number of prizes for that distribution
 * @returns
 */
export const usePrizePoolNetworkTotalNumberOfPrizes = () => {
  const prizePools = usePrizePools()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()
  const allTicketTwabTvlQueryResults = useAllPrizePoolTicketTwabTotalSupplies()
  const {
    data: prizePoolNetworkTvl,
    isFetched: isPrizePoolNetworkTvlFetched,
    isFetching: isPrizePoolNetworkTvlFetching
  } = usePrizePoolNetworkTicketTwabTotalSupply()
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
  const isPrizePoolTokensFetching = allPrizePoolTokensQueryResults.some(
    (queryResult) => queryResult.isFetching
  )
  const isTicketTwabTvlsFetching = allTicketTwabTvlQueryResults.some(
    (queryResult) => queryResult.isFetching
  )
  const isAllUpcomingPrizeConfigsFetching = allUpcomingPrizeTiersQueryResults.some(
    (queryResult) => queryResult.isFetching
  )

  const isFetched =
    isPrizePoolTokensFetched &&
    isTicketTwabTvlsFetched &&
    isPrizePoolNetworkTvlFetched &&
    isAllUpcomingPrizeConfigsFetched
  const isFetching =
    isPrizePoolNetworkTvlFetching ||
    isPrizePoolTokensFetching ||
    isTicketTwabTvlsFetching ||
    isAllUpcomingPrizeConfigsFetching

  return useQuery(
    [
      'usePrizePoolNetworkTotalNumberOfPrizes',
      prizePools?.map((p) => p.id()).join('-'),
      prizePoolNetworkTvl?.totalSupply.amount
    ],
    () => {
      let totalNumberOfPrizes = 0
      prizePools.forEach((prizePool) => {
        const { data: prizePoolTvl } = allTicketTwabTvlQueryResults.find(
          (queryResult) => queryResult.data.prizePoolId === prizePool.id()
        )
        console.log('b', { isFetched, isFetching })
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
      return totalNumberOfPrizes
    },
    {
      ...NO_REFETCH,
      enabled: isFetched
    }
  )
}
