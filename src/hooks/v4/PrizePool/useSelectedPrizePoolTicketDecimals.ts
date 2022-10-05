import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTicketDecimals } from './usePrizePoolTicketDecimals'

/**
 * NOTE: assumes all tickets have the same decimals.
 * @returns
 */
export const useSelectedPrizePoolTicketDecimals = () => {
  const prizePool = useSelectedPrizePool()
  return usePrizePoolTicketDecimals(prizePool)
}
