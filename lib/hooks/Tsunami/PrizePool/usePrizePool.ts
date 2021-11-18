import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizePool = (chainId: number, address: string) => {
  const linkedPrizePool = useLinkedPrizePool()
  return linkedPrizePool?.getPrizePool(chainId, address)
}
