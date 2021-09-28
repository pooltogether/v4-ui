import { TokenBalance, useRefetchInterval, useUsersAddress } from '@pooltogether/hooks'
import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { formatUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

export interface UsersPrizePoolBalances {
  ticket: TokenBalance
  token: TokenBalance
}

export const useUsersPrizePoolBalances = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const refetchInterval = useRefetchInterval(prizePool?.chainId)

  const enabled = Boolean(prizePool) && Boolean(usersAddress)

  return useQuery(
    ['getUsersTokenBalances', prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolBalances(prizePool, usersAddress),
    {
      refetchInterval,
      enabled
    }
  )
}

const prettyNumber = (amount: BigNumber, decimals: string): string =>
  numberWithCommas(amount, { decimals }) as string

const getUsersPrizePoolBalances = async (
  prizePool: PrizePool,
  usersAddress: string
): Promise<UsersPrizePoolBalances> => {
  const balancesPromise = prizePool.getUsersPrizePoolBalances(usersAddress)
  const ticketPromise = prizePool.getTicketData()
  const tokenPromise = prizePool.getTokenData()
  const [balances, ticket, token] = await Promise.all([
    balancesPromise,
    ticketPromise,
    tokenPromise
  ])
  return {
    ticket: {
      hasBalance: !balances.ticket.isZero(),
      amountUnformatted: balances.ticket,
      amount: formatUnits(balances.ticket, ticket.decimals),
      amountPretty: prettyNumber(balances.ticket, ticket.decimals)
    },
    token: {
      hasBalance: !balances.token.isZero(),
      amountUnformatted: balances.token,
      amount: formatUnits(balances.token, token.decimals),
      amountPretty: prettyNumber(balances.token, token.decimals)
    }
  }
}
