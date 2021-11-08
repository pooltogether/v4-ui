import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizeDistributor = (chainId: number, address: string) => {
  const linkedPrizePool = useLinkedPrizePool()
  return linkedPrizePool?.getPrizeDistributor(chainId, address)
}
