import { useQueries, UseQueryOptions } from 'react-query'
import { usePrizePools } from './usePrizePools'
import {
  getPrizePoolTokens,
  PrizePoolTokens,
  PRIZE_POOL_TOKENS_QUERY_KEY
} from './usePrizePoolTokens'

export const useAllPrizePoolTokens = () => {
  const prizePools = usePrizePools()
  return useQueries<UseQueryOptions<PrizePoolTokens>[]>(
    prizePools.map((prizePool) => ({
      queryKey: [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
