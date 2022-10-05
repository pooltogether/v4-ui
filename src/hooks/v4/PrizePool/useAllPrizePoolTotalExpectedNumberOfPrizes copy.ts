import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { useAllPrizePoolPercentagesofPicks } from './useAllPrizePoolPercentagesofPicks'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { useAllUpcomingPrizeTiers } from './useAllUpcomingPrizeTiers'
import {
  getPrizePoolTotalNumberofPrizes,
  getPrizePoolTotalNumberOfPrizesKey
} from './usePrizePoolExpectedPrizes'
import { usePrizePools } from './usePrizePools'

export const useAllPrizePoolExpectedPrizes = () => {
  const prizePools = usePrizePools()
  const allPrizeTiersQueryResults = useAllUpcomingPrizeTiers()
  const allPercentagesOfPicksQueryResults = useAllPrizePoolPercentagesofPicks()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()

  const queries = useMemo(
    () =>
      prizePools.map((prizePool) => {
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
          enabled:
            !!prizeTierQueryResult?.isFetched &&
            !!percentageOfPicksQueryResult?.isFetched &&
            !!tokensQueryResult?.isFetched
        }
      }),
    [
      prizePools,
      allPrizeTiersQueryResults,
      allPercentagesOfPicksQueryResults,
      allPrizePoolTokensQueryResults
    ]
  )

  return useQueries(queries)
}
