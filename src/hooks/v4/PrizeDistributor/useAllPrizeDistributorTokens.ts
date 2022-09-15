import { Token } from '@pooltogether/hooks'
import { useQueries, UseQueryOptions } from 'react-query'

import { usePrizeDistributors } from './usePrizeDistributors'
import {
  getPrizeDistributorToken,
  PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY
} from './usePrizeDistributorToken'

export const useAllPrizeDistributorTokens = () => {
  const prizeDistributors = usePrizeDistributors()
  return useQueries<
    UseQueryOptions<{
      prizeDistributorId: string
      token: Token
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: [PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY, prizeDistributor?.id()],
      queryFn: async () => getPrizeDistributorToken(prizeDistributor)
    }))
  )
}
