import { TokenWithBalance, useUsersPrizePoolBalances } from '@pooltogether/hooks'
import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'

export const USERS_PRIZE_POOL_BALANCES_QUERY_KEY = 'useUsersPrizePoolBalancesWithFiat'

/**
 * NOTE: Assumes tickets and tokens are stablecoins.
 * Fetches users ticket and token balances and converts them to USD.
 * @param usersAddress
 * @param prizePool
 * @returns
 */
export const useUsersPrizePoolBalancesWithFiat = (usersAddress: string, prizePool: PrizePool) => {
  const { data, ...queryResults } = useUsersPrizePoolBalances(usersAddress, prizePool)

  return useMemo(() => {
    if (!data) return { ...queryResults, data: undefined }

    return {
      ...queryResults,
      data: getUsersPrizePoolBalances(prizePool, usersAddress, data.balances)
    }
  }, [data, queryResults?.isFetched, queryResults?.isFetching])
}

export const getUsersPrizePoolBalances = (
  prizePool: PrizePool,
  usersAddress: string,
  balances: {
    ticket: TokenWithBalance
    token: TokenWithBalance
  }
) => {
  return {
    prizePool,
    usersAddress,
    balances: {
      ticket: makeTokenWithUsdBalance(balances.ticket),
      token: makeTokenWithUsdBalance(balances.token)
    }
  }
}

/**
 * NOTE: Assumes token is a stablecoin.
 * @param token
 * @param balances
 */
const makeTokenWithUsdBalance = (token: TokenWithBalance) => {
  const balance = getAmountFromUnformatted(token.amountUnformatted, token.decimals)
  const balanceUsd = getAmountFromUnformatted(token.amountUnformatted, token.decimals, {
    style: 'currency',
    currency: 'usd'
  })
  const balanceUsdScaled = toScaledUsdBigNumber(balance.amount)
  return {
    ...token,
    ...balance,
    hasBalance: !token.amountUnformatted.isZero(),
    balanceUsd,
    usdPerToken: 1,
    balanceUsdScaled
  }
}
