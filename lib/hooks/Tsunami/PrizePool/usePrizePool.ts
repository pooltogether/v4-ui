import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

// TODO: Migrade to useMemo like usePrizeDistributor
export const usePrizePool = (address: string, chainId: number) => {
  const { data: linkedPrizePool, ...useQueryResponse } = useLinkedPrizePool()
  return {
    ...useQueryResponse,
    data: linkedPrizePool?.prizePools.find(
      (prizePool) => prizePool.address === address && prizePool.chainId === chainId
    )
  }
}
