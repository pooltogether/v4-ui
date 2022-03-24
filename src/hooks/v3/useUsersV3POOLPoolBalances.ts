import { useMemo } from 'react'

import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { POOL_PRIZE_POOL_ADDRESSES } from '@constants/v3'
import { useAllUsersV3Balances, V3PrizePoolBalances } from './useAllUsersV3Balances'
import { CHAIN_ID } from '@constants/misc'

/**
 * Returns a users POOL Pool balances.
 * @param usersAddress
 * @returns
 */
export const useUsersV3POOLPoolBalances = (usersAddress: string) => {
  const queriesResult = useAllUsersV3Balances(usersAddress)

  return useMemo(() => {
    const refetch = async () => queriesResult.forEach((queryResult) => queryResult.refetch())
    const isFetched =
      queriesResult.length > 0 && queriesResult.every((queryResult) => queryResult.isFetched)

    if (!isFetched) {
      return {
        isFetching: true,
        isFetched: false,
        refetch,
        data: null
      }
    }

    const balances: V3PrizePoolBalances[] = []

    let totalValueUsdScaled = BigNumber.from(0)

    queriesResult.forEach((queryResult) => {
      const { data: balancesForChainId } = queryResult
      balancesForChainId.balances.forEach((balance) => {
        const chainId = balance.chainId

        // NOTE: Hide Polygon POOL staking.
        const POOLPoolAddresses =
          chainId === CHAIN_ID.polygon ? [] : POOL_PRIZE_POOL_ADDRESSES[chainId] || []

        // Filter POOL Pools.
        const isPOOLPool = POOLPoolAddresses.includes(balance.prizePool.addresses.prizePool)
        // Only add if ticket, not sponsorship or pod
        const isTicket = balance.ticket.address === balance.prizePool.addresses.ticket

        if (isTicket && isPOOLPool) {
          balances.push(balance)
          if (balance.ticket.balanceUsdScaled) {
            totalValueUsdScaled = totalValueUsdScaled.add(balance.ticket.balanceUsdScaled)
          }
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
