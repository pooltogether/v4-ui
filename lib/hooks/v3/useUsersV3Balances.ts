import { useMemo } from 'react'

import { useAllUsersV3Balances, V3TokenBalance } from './useAllUsersV3Balances'
import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

/**
 * Returns a users balances for V3 Prize Pools.
 * Filters zero balances.
 * @param usersAddress
 * @returns
 */
export const useUsersV3Balances = (usersAddress: string) => {
  const queriesResult = useAllUsersV3Balances(usersAddress)

  return useMemo(() => {
    const refetch = async () => queriesResult.forEach((queryResult) => queryResult.refetch())
    const isFetched = queriesResult.every((queryResult) => queryResult.isFetched)

    if (!isFetched) {
      return {
        isFetching: true,
        isFetched: false,
        refetch,
        data: null
      }
    }

    const balances: V3TokenBalance[] = []

    let totalValueUsdScaled = BigNumber.from(0)

    queriesResult.forEach((queryResult) => {
      const { data: balancesForChainId } = queryResult
      balancesForChainId.balances.forEach((balance) => {
        if (balance.ticket.hasBalance) {
          balances.push(balance)
          totalValueUsdScaled = totalValueUsdScaled.add(balance.balanceUsdScaled)
        }
      })
    })

    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')

    return {
      isFetching: false,
      isFetched: true,
      refetch,
      data: { balances, totalValueUsd, totalValueUsdScaled }
    }
  }, [queriesResult])
}
