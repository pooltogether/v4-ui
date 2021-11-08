import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

export const usePrizeDistributors = () => {
  const linkedPrizePool = useLinkedPrizePool()
  return linkedPrizePool?.prizeDistributors
}
