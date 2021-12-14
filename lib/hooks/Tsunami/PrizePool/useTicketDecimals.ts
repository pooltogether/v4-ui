import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedChainId } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedChainId'

export const useTicketDecimals = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket.decimals }
}
