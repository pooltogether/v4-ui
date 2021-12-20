import { usePrizePoolTokens } from 'lib/hooks/v4/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedChainId } from 'lib/hooks/v4/PrizePool/usePrizePoolBySelectedChainId'

export const useTicketDecimals = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket.decimals }
}
