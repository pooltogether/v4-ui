import { usePrizePoolTokens } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'

export const usePrizePoolTicketDecimals = (prizePool: PrizePool) => {
  const { data: tokens, ...data } = usePrizePoolTokens(prizePool)
  return { ...data, data: tokens?.ticket.decimals }
}
