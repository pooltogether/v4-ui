import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { NO_REFETCH } from '@constants/query'
import { useQuery, UseQueryOptions } from 'react-query'

export interface PrizePoolTokens {
  chainId: number
  prizePoolId: string
  token: Token
  ticket: Token
}

export const PRIZE_POOL_TOKENS_QUERY_KEY = 'prizePoolTokens'

export const usePrizePoolTokens = (prizePool: PrizePool) => {
  return useQuery(
    [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
    async () => getPrizePoolTokens(prizePool),
    { ...NO_REFETCH } as UseQueryOptions<PrizePoolTokens>
  )
}

export const getPrizePoolTokens = async (prizePool: PrizePool) => {
  const ticketDataPromise = prizePool.getTicketData()
  const tokenDataPromise = prizePool.getTokenData()

  const [ticketData, tokenData] = await Promise.all([ticketDataPromise, tokenDataPromise])

  const ticketContract = await prizePool.getTicketContract()
  const tokenContract = await prizePool.getTokenContract()

  const ticket: Token = {
    address: ticketContract.address,
    symbol: ticketData.symbol,
    name: ticketData.name,
    decimals: ticketData.decimals
  }

  const token: Token = {
    address: tokenContract.address,
    symbol: tokenData.symbol,
    name: tokenData.name,
    decimals: tokenData.decimals
  }

  return {
    chainId: prizePool.chainId,
    prizePoolId: prizePool.id(),
    ticket,
    token
  } as PrizePoolTokens
}
