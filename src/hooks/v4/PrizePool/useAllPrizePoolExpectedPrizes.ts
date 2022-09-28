import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { useAllPrizePoolPercentagesofPicks } from './useAllPrizePoolPercentagesofPicks'
import { useAllPrizePoolPrizes } from './useAllPrizePoolPrizes'
import {
  getPrizePoolExpectedPrizes,
  getPrizePoolExpectedPrizesKey
} from './usePrizePoolExpectedPrizes'
import { usePrizePools } from './usePrizePools'

/**
 * * Fetches prize data for all prize pools and scales the data according to the expected number of picks a prize pool will receive
 * @returns
 */
export const useAllPrizePoolExpectedPrizes = () => {
  const prizePools = usePrizePools()
  const allPrizePoolPrizesQueryResults = useAllPrizePoolPrizes()
  const allPercentagesOfPicksQueryResults = useAllPrizePoolPercentagesofPicks()

  const queries = useMemo(
    () =>
      prizePools.map((prizePool) => {
        const prizeQueryResult = allPrizePoolPrizesQueryResults.find(
          (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
        )
        const percentageOfPicksQueryResult = allPercentagesOfPicksQueryResults.find(
          (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
        )

        const prizeData = prizeQueryResult?.data
        const percentage = percentageOfPicksQueryResult?.data?.percentage

        return {
          queryKey: getPrizePoolExpectedPrizesKey(
            prizeData?.prizeTier,
            percentage,
            prizeData?.decimals
          ),
          queryFn: () => getPrizePoolExpectedPrizes(prizeData, percentage),
          enabled: !!prizeQueryResult?.isFetched && !!percentageOfPicksQueryResult?.isFetched
        }
      }),
    [prizePools, allPrizePoolPrizesQueryResults, allPercentagesOfPicksQueryResults]
  )

  return useQueries(queries)
}
