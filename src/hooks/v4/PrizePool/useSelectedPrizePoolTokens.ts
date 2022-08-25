import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

import { useSelectedPrizePool } from './useSelectedPrizePool'

export const useSelectedPrizePoolTokens = () => {
  const prizePool = useSelectedPrizePool()
  return usePrizePoolTokens(prizePool)
}
