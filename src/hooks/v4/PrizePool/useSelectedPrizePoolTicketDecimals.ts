import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'

import { usePrizePoolTicketDecimals } from './usePrizePoolTicketDecimals'

/**
 * NOTE: assumes all tickets have the same decimals.
 * @returns
 */
export const useSelectedPrizePoolTicketDecimals = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  return usePrizePoolTicketDecimals(prizePool)
}
