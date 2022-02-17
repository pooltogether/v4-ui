import { useMemo } from 'react'
import { TokenWithUsdBalance } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { POOL_PRIZE_POOL_ADDRESSES } from '@constants/v3'
import { useAllUsersV3Balances } from './useAllUsersV3Balances'

/**
 * Returns a users POOL balances.
 * @param usersAddress
 * @returns
 */
export const useUsersV3POOLTokenBalances = (usersAddress: string) => {
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

    const balancesByChainId: { [chainId: number]: TokenWithUsdBalance[] } = {}

    queriesResult.forEach((queryResult) => {
      const { data: balancesForChainId } = queryResult
      balancesForChainId.balances.forEach((balance) => {
        const chainId = balance.chainId
        const POOLPoolAddresses = POOL_PRIZE_POOL_ADDRESSES[chainId] || []

        // Filter POOL Pools.
        const isPOOLPool = POOLPoolAddresses.includes(balance.prizePool.addresses.prizePool)
        // Only add if ticket, not sponsorship or pod
        const isTicket = balance.ticket.address === balance.prizePool.addresses.ticket

        if (isTicket && isPOOLPool) {
          if (!balancesByChainId[chainId]) {
            balancesByChainId[chainId] = []
          }
          // Add token
          balancesByChainId[chainId].push(balance.token)
        }
      })
    })

    const chainIds = Object.keys(balancesByChainId).map(Number)
    let totalValueUsdScaled = BigNumber.from(0)
    chainIds.forEach((chainId) => {
      const balances = balancesByChainId[chainId]
      balances.forEach((balance) => {
        if (balance.balanceUsdScaled) {
          totalValueUsdScaled = totalValueUsdScaled.add(balance.balanceUsdScaled)
        }
      })
    })
    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')

    return {
      isFetching: false,
      isFetched: true,
      refetch,
      data: { balances: balancesByChainId, totalValueUsd, totalValueUsdScaled }
    }
  }, [queriesResult])
}
