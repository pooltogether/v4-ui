import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { Token } from '@pooltogether/hooks'
import { msToS } from '@pooltogether/utilities'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const PRIZE_POOL_TICKET_TWAB_TOTAL_SUPPLY_QUERY_KEY = 'usePrizePoolTicketTotalSupply'

export const usePrizePoolTicketTwabTotalSupply = (prizePool: PrizePool) => {
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const enabled = !!prizePool && isTokenDataFetched
  return useQuery(
    [PRIZE_POOL_TICKET_TWAB_TOTAL_SUPPLY_QUERY_KEY, prizePool?.id(), tokenData?.ticket.address],
    () => getPrizePoolTicketTwabTotalSupply(prizePool, tokenData?.ticket),
    {
      enabled
    }
  )
}

export const getPrizePoolTicketTwabTotalSupply = async (prizePool: PrizePool, ticket: Token) => {
  const timestamp = Math.round(msToS(Date.now()))
  const totalSupplyUnformatted = await prizePool.getTicketTwabTotalSupplyAt(timestamp)
  return {
    prizePoolId: prizePool.id(),
    amount: getAmountFromUnformatted(totalSupplyUnformatted, ticket.decimals)
  }
}
