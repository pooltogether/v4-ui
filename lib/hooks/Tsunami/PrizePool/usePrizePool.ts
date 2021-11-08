import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizePool = (address: string, chainId: number) => {
  const linkedPrizePool = useLinkedPrizePool()
  return linkedPrizePool?.getPrizePool(chainId, address)
}
