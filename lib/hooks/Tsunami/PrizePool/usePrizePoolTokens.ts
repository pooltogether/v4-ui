import { Token } from '.yalc/@pooltogether/hooks/dist'
import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'

interface PrizePoolTokens {
  token: Token
  ticket: Token
}

export const usePrizePoolTokens = (prizePool: PrizePool) => {
  const enabled = Boolean(prizePool)
  return useQuery(
    'prizePoolTokens',
    async () => {
      const tokenDataPromise = prizePool.getTokenData()
      const ticketDataPromise = prizePool.getTicketData()

      const [ticketData, tokenData] = await Promise.all([ticketDataPromise, tokenDataPromise])

      const ticket: Token = {
        address: prizePool.ticket.address,
        symbol: ticketData.symbol,
        name: ticketData.name,
        decimals: ticketData.decimals
      }

      const token: Token = {
        address: prizePool.token.address,
        symbol: tokenData.symbol,
        name: tokenData.name,
        decimals: tokenData.decimals
      }

      return {
        ticket,
        token
      } as PrizePoolTokens
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<PrizePoolTokens>
  )
}
