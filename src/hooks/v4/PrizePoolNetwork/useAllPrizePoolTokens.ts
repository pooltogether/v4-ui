import { getPrizePoolTokens, getPrizePoolTokensQueryKey, NO_REFETCH } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQueries } from 'react-query'

/**
 * Fetches all tokens for all v4 prize pools provided
 * @param prizePools
 * @returns
 */
export const useAllPrizePoolTokens = (prizePools: PrizePool[]) => {
  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: getPrizePoolTokensQueryKey(prizePool),
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
