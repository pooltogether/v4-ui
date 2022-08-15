import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { useQuery } from 'react-query'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useUsersPrizePoolBalances } from './useUsersPrizePoolBalances'

export interface UsersPrizePoolBalances {
  ticket: TokenWithUsdBalance
  token: TokenWithUsdBalance
}

export const USERS_PRIZE_POOL_BALANCES_QUERY_KEY = 'useUsersPrizePoolBalancesWithFiat'

/**
 * NOTE: Assumes tickets and tokens are stablecoins
 * @param usersAddress
 * @param prizePool
 * @returns
 */
export const useUsersPrizePoolBalancesWithFiat = (usersAddress: string, prizePool: PrizePool) => {
  const { data: balances } = useUsersPrizePoolBalances(usersAddress, prizePool)

  return useQuery(
    [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
    async () => getUsersPrizePoolBalances(prizePool, usersAddress, balances?.balances),
    {
      enabled: !!balances
    }
  )
}

export const getUsersPrizePoolBalances = async (
  prizePool: PrizePool,
  usersAddress: string,
  balances: {
    ticket: TokenWithBalance
    token: TokenWithBalance
  }
): Promise<{
  prizePool: PrizePool
  usersAddress: string
  balances: UsersPrizePoolBalances
}> => {
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
  const balance = getAmountFromBigNumber(token.amountUnformatted, token.decimals)
  const balanceUsdScaled = toScaledUsdBigNumber(balance.amount)
  return {
    ...token,
    ...balance,
    hasBalance: !token.amountUnformatted.isZero(),
    balanceUsd: balance,
    usdPerToken: 1,
    balanceUsdScaled
  }
}
