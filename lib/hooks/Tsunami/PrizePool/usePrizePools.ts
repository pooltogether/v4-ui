import { useLinkedPrizePool } from 'lib/hooks/Tsunami/LinkedPrizePool/useLinkedPrizePool'

export const usePrizePools = () => {
  const linkedPrizePool = useLinkedPrizePool()
  return linkedPrizePool?.prizePools
}
