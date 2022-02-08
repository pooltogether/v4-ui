import { useMemo } from 'react'

import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { LP_PRIZE_POOL_METADATA } from 'lib/constants/v3'
import { useAllUsersV3Balances, V3PrizePoolBalances } from './useAllUsersV3Balances'

/**
 * Returns a users LP Pool balances.
 * @param usersAddress
 * @returns
 */
export const useUsersV3LPPoolBalances = (usersAddress: string) => {
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

    const balances: V3PrizePoolBalances[] = []

    let totalValueUsdScaled = BigNumber.from(0)

    queriesResult.forEach((queryResult) => {
      const { data: balancesForChainId } = queryResult
      balancesForChainId.balances.forEach((balance) => {
        const chainId = balance.chainId
        const LPPoolAddresses = LP_PRIZE_POOL_METADATA[chainId]?.map((p) => p.prizePool) || []

        // Filter LP Pools.
        const isLPPool = LPPoolAddresses.includes(balance.prizePool.addresses.prizePool)
        // Only add if ticket, not sponsorship or pod
        const isTicket = balance.ticket.address === balance.prizePool.addresses.ticket

        if (isTicket && isLPPool) {
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
