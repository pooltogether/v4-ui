import { PrizePool } from '@pooltogether/v4-client-js'
import { formatUnits } from '@ethersproject/units'
import { prettyNumber } from '@pooltogether/utilities'
import { useQuery } from 'react-query'
import { TokenWithBalance, useRefetchInterval, Token } from '@pooltogether/hooks'
import { usePrizePoolTokens } from './usePrizePoolTokens'

export interface UsersPrizePoolBalances {
  ticket: TokenWithBalance
  token: TokenWithBalance
}

export const USERS_PRIZE_POOL_BALANCES_QUERY_KEY = 'useUsersPrizePoolBalances'

export const useUsersPrizePoolBalances = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)

  const enabled = Boolean(prizePool) && Boolean(usersAddress) && isFetched

  return useQuery(
    [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolBalances(prizePool, usersAddress, tokens),
    {
      refetchInterval,
      enabled
    }
  )
}

export const getUsersPrizePoolBalances = async (
  prizePool: PrizePool,
  usersAddress: string,
  tokens: {
    prizePoolId: string
    chainId: number
    ticket: Token
    token: Token
  }
) => {
  const balances = await prizePool.getUserPrizePoolBalances(usersAddress)
  const { ticket: _ticket, token: _token } = tokens
  const ticket: TokenWithBalance = {
    ..._ticket,
    hasBalance: !balances.ticket.isZero(),
    amountUnformatted: balances.ticket,
    amount: formatUnits(balances.ticket, _ticket.decimals),
    amountPretty: prettyNumber(balances.ticket, _ticket.decimals)
  }
  const token: TokenWithBalance = {
    ..._token,
    hasBalance: !balances.token.isZero(),
    amountUnformatted: balances.token,
    amount: formatUnits(balances.token, _token.decimals),
    amountPretty: prettyNumber(balances.token, _token.decimals)
  }

  return {
    prizePoolId: prizePool.id(),
    chainId: prizePool.chainId,
    usersAddress,
    balances: {
      ticket,
      token
    }
  }
}
