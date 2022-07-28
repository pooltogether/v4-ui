import { NO_REFETCH } from '@constants/query'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQueries } from 'react-query'
import { getPrizePoolTokens, PRIZE_POOL_TOKENS_QUERY_KEY } from './usePrizePoolTokens'

export const useAllPrizePoolTokens = (prizePools: PrizePool[]) => {
  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
