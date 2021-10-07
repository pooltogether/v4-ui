import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'

export interface PrizePoolTokens {
  token: Token
  ticket: Token
}

export const usePrizePoolTokens = (prizePool: PrizePool) => {
  const enabled = Boolean(prizePool)
  return useQuery(
    'prizePoolTokens',
    async () => {
      const ticketDataPromise = prizePool.getTicketData()
      const tokenDataPromise = prizePool.getTokenData()

      const [ticketData, tokenData] = await Promise.all([ticketDataPromise, tokenDataPromise])

      const ticket: Token = {
        address: prizePool.ticketMetadata.address,
        symbol: ticketData.symbol,
        name: ticketData.name,
        decimals: ticketData.decimals
      }

      const token: Token = {
        address: prizePool.tokenMetadata.address,
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
