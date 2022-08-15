import { useQueries } from 'react-query'
import { usePrizePoolsByChainId } from './usePrizePoolsByChainId'
import { getPrizePoolTokens, PRIZE_POOL_TOKENS_QUERY_KEY } from './usePrizePoolTokens'

export const usePrizePoolTokensByChainId = (chainId: number) => {
  const prizePools = usePrizePoolsByChainId(chainId)
  return useQueries(
    prizePools.map((prizePool) => ({
      queryKey: [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
