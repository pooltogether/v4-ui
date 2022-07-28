import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

/**
 * NOTE: assumes all tickets have the same decimals.
 * @returns
 */
export const useSelectedPrizePoolTicketDecimals = () => {
  const prizePool = useSelectedPrizePool()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket.decimals }
}
