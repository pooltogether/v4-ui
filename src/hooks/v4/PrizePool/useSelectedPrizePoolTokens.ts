import { usePrizePoolTokens } from '@pooltogether/hooks'
import { useSelectedPrizePool } from './useSelectedPrizePool'

export const useSelectedPrizePoolTokens = () => {
  const prizePool = useSelectedPrizePool()
  return usePrizePoolTokens(prizePool)
}
