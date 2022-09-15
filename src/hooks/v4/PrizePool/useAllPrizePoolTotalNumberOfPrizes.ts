import { useQueries } from 'react-query'

import { useAllPrizePoolPercentagesofPicks } from './useAllPrizePoolPercentagesofPicks'
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

  const isPrizeTiersFetched = allPrizeTiersQueryResults.every(({ isFetched }) => isFetched)
  const isPercentagesFetched = allPercentagesOfPicksQueryResults.every(({ isFetched }) => isFetched)

  const enabled = isPrizeTiersFetched && isPercentagesFetched

  return useQueries(
    enabled
      ? prizePools.map((prizePool) => {
          const prizeTierQueryResult = allPrizeTiersQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const percentageOfPicksQueryResult = allPercentagesOfPicksQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )

          const prizeTier = prizeTierQueryResult?.data?.prizeTier
          const percentage = percentageOfPicksQueryResult?.data?.percentage

          return {
            queryKey: getPrizePoolTotalNumberOfPrizesKey(prizeTier, percentage),
            queryFn: () => getPrizePoolTotalNumberofPrizes(prizePool, prizeTier, percentage),
            enabled
          }
        })
      : []
  )
}
