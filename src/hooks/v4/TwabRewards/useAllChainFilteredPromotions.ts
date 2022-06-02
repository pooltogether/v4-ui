import { useQueries } from 'react-query'

import { NO_REFETCH } from '@constants/query'

import { useSupportedTwabRewardsChainIds } from '@hooks/v4/TwabRewards/useSupportedTwabRewardsChainIds'
import { useTwabRewardsSubgraphClient } from '@hooks/v4/TwabRewards/useTwabRewardsSubgraphClient'

export const getChainsFilteredPromotionsKey = (chainId: number) => [
  'getChainsFilteredPromotions',
  chainId
]

/**
 * Fetch users balances for all tokens in all prize pools
 * @param usersAddress
 * @returns
 */
export const useAllChainFilteredPromotions = (chainId: number) => {
  const chainIds = useSupportedTwabRewardsChainIds()

  return useQueries(
    chainIds.map((chainId) => ({
      ...NO_REFETCH,
      queryKey: getChainsFilteredPromotionsKey(chainId),
      queryFn: async () => getChainsFilteredPromotions(chainId),
      enabled: Boolean(chainId)
    }))
  )
}

export const getChainsFilteredPromotions = async (chainId: number) => {
  const client = useTwabRewardsSubgraphClient(chainId)
  // const promotions =
  console.log(client)

  return {
    chainId
    // promotions
  }
}
