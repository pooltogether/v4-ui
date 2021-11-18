import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedNetwork } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedNetwork'

export const useTicketDecimals = () => {
  const prizePool = usePrizePoolBySelectedNetwork()
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket.decimals }
}
