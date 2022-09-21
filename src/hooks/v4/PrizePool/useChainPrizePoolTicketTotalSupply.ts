import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTotalSupply'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

export const useChainPrizePoolTicketTotalSupply = (chainId: number) => {
  const prizePool = usePrizePoolByChainId(chainId)
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const { data: prizePoolTotalSupply } = usePrizePoolTicketTotalSupply(prizePool)
  return { prizePoolTotalSupply, decimals: tokens?.ticket.decimals, ticket: tokens?.ticket }
}
