import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useMemo } from 'react'

export const useChainPrizePoolTicketTotalSupply = (chainId) => {
  const prizePool = usePrizePoolByChainId(chainId)
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const { data: prizePoolTotalSupply } = usePrizePoolTicketTotalSupply(prizePool)
  return useMemo(
    () => ({ prizePoolTotalSupply, decimals: tokens?.ticket.decimals, ticket: tokens?.ticket }),
    [tokens, prizePoolTotalSupply]
  )
}
