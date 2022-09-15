import { useQueries } from 'react-query'

import { usePrizePools } from './usePrizePools'
import { getPrizePoolTokens, PRIZE_POOL_TOKENS_QUERY_KEY } from './usePrizePoolTokens'

export const useAllPrizePoolTokens = () => {
  const prizePools = usePrizePools()
  return useQueries(
    prizePools.map((prizePool) => ({
      queryKey: [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
      queryFn: async () => getPrizePoolTokens(prizePool)
    }))
  )
}
