import { BigNumber } from 'ethers'
import { useMemo } from 'react'

import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useAllUsersV3Balances, V3Token } from './useAllUsersV3Balances'

const POOL_POOL_ADDRESS = '0x396b4489da692788e327e2e4b2b0459a5ef26791'

/**
 * Returns a users balances for V3 Prize Pools.
 * Filters out the Mainnet POOL Pool.
 * @param usersAddress
 * @returns
 */
export const useUsersV3Balances = (usersAddress: string) => {
  const queryResults = useAllUsersV3Balances(usersAddress)

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
      const tokens = Object.values(queryResult.data.tokens)

      tokens.forEach((token) => {
        const isPOOLPool = POOL_POOL_ADDRESS === token.prizePool.prizePool.address

        if (!isPOOLPool && !token.balance.amountUnformatted.isZero()) {
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
