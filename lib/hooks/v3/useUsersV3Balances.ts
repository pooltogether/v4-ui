import { BigNumber } from 'ethers'
import { useMemo } from 'react'

import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useAllUsersV3Balances, V3Token } from './useAllUsersV3Balances'

/**
 * Returns a users balances for V3 Prize Pools.
 * Filters out the Mainnet POOL Pool.
 * @param usersAddress
 * @returns
 */
export const useUsersV3Balances = (usersAddress: string) => {
  const queryResults = useAllUsersV3Balances(usersAddress)

  console.log(queryResults)

  return useMemo(() => {
    const refetch = async () => queryResults.forEach((queryResult) => queryResult.refetch())

    const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

    if (!isFetched) {
      return {
        isFetching: true,
        isFetched: false,
        refetch,
        data: null
      }
    }

    const balances: V3Token[] = []
    let totalValueUsdScaled = BigNumber.from(0)

    queryResults.forEach((queryResult) => {
      let tokens = []
      if (queryResult?.data?.tokens) {
        tokens = Object.values(queryResult.data.tokens)
      }
      console.log(queryResult)
      console.log(tokens)

      tokens.forEach((token) => {
        if (!token.balance.amountUnformatted.isZero()) {
          balances.push(token)
          totalValueUsdScaled = totalValueUsdScaled.add(token.balanceValueUsdScaled)
        }
      })
    })
    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')

    return {
      isFetching: false,
      isFetched: true,
      refetch,
      data: {
        balances,
        totalValueUsdScaled,
        totalValueUsd
      }
    }
  }, [queryResults])
}
