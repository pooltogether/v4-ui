import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'

/**
 * NOTE: assumes all tickets have the same decimals.
 * @returns
 */
export const useSelectedPrizePoolTicket = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket }
}
