import { useMemo } from 'react'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizePool = (address: string, chainId: number) => {
  const { data: linkedPrizePool } = useLinkedPrizePool()
  return useMemo(() => {
    if (!linkedPrizePool) return null
    const prizePool = linkedPrizePool.prizePools.find(
      (prizeDistributor) =>
        prizeDistributor.chainId === chainId && prizeDistributor.address === address
    )
    if (!prizePool) return null
    return prizePool
  }, [linkedPrizePool, chainId])
}
