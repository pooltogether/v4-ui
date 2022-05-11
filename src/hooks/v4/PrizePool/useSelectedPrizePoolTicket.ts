import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'

/**
 * NOTE: assumes all tickets have the same decimals.
 * @returns
 */
export const useSelectedPrizePoolTicket = () => {
  const prizePool = useSelectedPrizePool()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket }
}
