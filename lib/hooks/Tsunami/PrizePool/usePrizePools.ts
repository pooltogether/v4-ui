import { useLinkedPrizePool } from 'lib/hooks/Tsunami/LinkedPrizePool/useLinkedPrizePool'

export const usePrizePools = () => {
  const { data: linkedPrizePool } = useLinkedPrizePool()
  return linkedPrizePool?.prizePools
}
