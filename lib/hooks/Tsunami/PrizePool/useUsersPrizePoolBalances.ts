import { TokenBalance, useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { formatUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { PrizePoolTokens, usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'

export interface UsersPrizePoolBalances {
  ticket: TokenBalance
  token: TokenBalance
}

export const useUsersPrizePoolBalances = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)

  const enabled = Boolean(prizePool) && Boolean(usersAddress) && isFetched

  return useQuery(
    ['useUsersPrizePoolBalances', prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolBalances(prizePool, usersAddress, tokens),
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
  usersAddress: string,
  tokens: PrizePoolTokens
): Promise<{ [usersAddress: string]: UsersPrizePoolBalances }> => {
  const balances = await prizePool.getUsersPrizePoolBalances(usersAddress)
  const { ticket, token } = tokens

  return {
    [usersAddress]: {
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
}
