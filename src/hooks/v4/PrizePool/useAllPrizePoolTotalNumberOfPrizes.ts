import { useQueries } from 'react-query'
import { useAllPrizePoolPercentagesofPicks } from './useAllPrizePoolPercentagesofPicks'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { useAllUpcomingPrizeTiers } from './useAllUpcomingPrizeTiers'
import { usePrizePools } from './usePrizePools'
import {
  getPrizePoolTotalNumberofPrizes,
  getPrizePoolTotalNumberOfPrizesKey
} from './usePrizePoolTotalNumberOfPrizes'

export const useAllPrizePoolTotalNumberOfPrizes = () => {
  const prizePools = usePrizePools()
  const allPrizeTiersQueryResults = useAllUpcomingPrizeTiers()
  const allPercentagesOfPicksQueryResults = useAllPrizePoolPercentagesofPicks()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()

  const isPrizeTiersFetched = allPrizeTiersQueryResults.every(({ isFetched }) => isFetched)
  const isTokensFetched = allPrizePoolTokensQueryResults.every(({ isFetched }) => isFetched)
  const isPercentagesFetched = allPercentagesOfPicksQueryResults.every(({ isFetched }) => isFetched)

  const enabled = isPrizeTiersFetched && isPercentagesFetched && isTokensFetched

  return useQueries(
    enabled
      ? prizePools.map((prizePool) => {
          const prizeTierQueryResult = allPrizeTiersQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const percentageOfPicksQueryResult = allPercentagesOfPicksQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const tokensQueryResult = allPrizePoolTokensQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )

          const prizeTier = prizeTierQueryResult?.data?.prizeTier
          const percentage = percentageOfPicksQueryResult?.data?.percentage
          const decimals = tokensQueryResult?.data?.ticket.decimals

          return {
            queryKey: getPrizePoolTotalNumberOfPrizesKey(prizeTier, percentage, decimals),
            queryFn: () =>
              getPrizePoolTotalNumberofPrizes(prizePool, prizeTier, percentage, decimals),
            enabled
          }
        })
      : []
  )
}
