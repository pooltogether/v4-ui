import { useMemo } from 'react'
import { useAllChainsFilteredPromotions } from './useAllChainsFilteredPromotions'

export const useChainTwabRewardsPromotions = (chainId: number) => {
  const queries = useAllChainsFilteredPromotions()
  return useMemo(
    () => queries.find((query) => query.isFetched && query.data.chainId === chainId) || queries[0],
    [chainId, queries]
  )
}
