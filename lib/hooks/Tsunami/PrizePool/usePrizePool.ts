import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizePool = (address: string, chainId: number) => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const enabled =
    isLinkedPrizePoolFetched && Boolean(linkedPrizePool) && Boolean(address) && Boolean(chainId)
  return useQuery(
    ['usePrizePool', address, chainId],
    async () => {
      if (!linkedPrizePool) return null
      return linkedPrizePool.prizePools.find(
        (prizePool) =>
          prizePool.prizePool.address === address && prizePool.prizePool.chainId === chainId
      )
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<PrizePool>
  )
}
