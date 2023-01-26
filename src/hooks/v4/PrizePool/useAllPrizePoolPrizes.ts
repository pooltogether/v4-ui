import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { useAllUpcomingPrizeTiers } from './useAllUpcomingPrizeTiers'
import { getPrizePoolPrizes, getPrizePoolPrizesKey } from './usePrizePoolPrizes'
import { usePrizePools } from './usePrizePools'
import { usePrizeDistributors } from '../PrizeDistributor/usePrizeDistributors'

/**
 * Prize details across all prize pools
 * NOTE: Assumes 1 PrizeDistributor per chain
 * @returns
 */
export const useAllPrizePoolPrizes = () => {
  const prizePools = usePrizePools()
  const prizeDistributors = usePrizeDistributors()
  const allPrizeTiersQueryResults = useAllUpcomingPrizeTiers()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()

  const queries = useMemo(
    () =>
      prizePools.map((prizePool) => {
        const prizeDistributor = prizeDistributors.find(
          (prizeDistributor) => prizeDistributor.chainId === prizePool.chainId
        )
        const prizeTierQueryResult = allPrizeTiersQueryResults.find(
          (queryResult) => queryResult.data?.prizeDistributorId === prizeDistributor.id()
        )
        const tokensQueryResult = allPrizePoolTokensQueryResults.find(
          (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
        )

        const prizeTier = prizeTierQueryResult?.data?.prizeTier
        const decimals = tokensQueryResult?.data?.ticket.decimals

        return {
          queryKey: getPrizePoolPrizesKey(prizePool, prizeTier, decimals),
          queryFn: () => getPrizePoolPrizes(prizePool, prizeTier, decimals),
          enabled: !!prizeTierQueryResult?.isFetched && !!tokensQueryResult?.isFetched
        }
      }),
    [prizePools, allPrizeTiersQueryResults, allPrizePoolTokensQueryResults]
  )

  return useQueries(queries)
}
