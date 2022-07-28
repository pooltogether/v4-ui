import { NO_REFETCH } from '@constants/query'
import { useQueries, UseQueryOptions } from 'react-query'
import { usePrizePoolsByChainId } from './usePrizePoolsByChainId'
import { getPrizePoolTokens, PRIZE_POOL_TOKENS_QUERY_KEY } from './usePrizePoolTokens'

export const usePrizePoolTokensByChainId = (chainId: number) => {
  const prizePools = usePrizePoolsByChainId(chainId)
  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
