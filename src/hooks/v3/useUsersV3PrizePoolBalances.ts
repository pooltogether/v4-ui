import { LP_PRIZE_POOL_METADATA, POOL_PRIZE_POOL_ADDRESSES } from '@constants/v3'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'

import { useAllUsersV3Balances, V3PrizePoolBalances } from './useAllUsersV3Balances'

/**
 * Returns a users balances for V3 Prize Pools.
 * Filters zero balances.
 * filterAdditionalPools if true:
 * - Filters POOL Pools.
 * - Filters LP Pools.
 * @param usersAddress
 * @param filterAdditionalPools
 * @returns
 */
export const useUsersV3PrizePoolBalances = (usersAddress: string, filterAdditionalPools = true) => {
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
      balancesForChainId?.balances.forEach((balance) => {
        const chainId = balance.chainId
        const LPPrizePoolAddresses =
          LP_PRIZE_POOL_METADATA[chainId]?.map(
            (prizePoolMetadata) => prizePoolMetadata.prizePool
          ) || []
        const POOLPoolAddresses = POOL_PRIZE_POOL_ADDRESSES[chainId] || []

        const isRegularPrizePoolBalance = !balance.isPod && !balance.isSponsorship

        // Filter zero balances.
        // Filter POOL Pools.
        // Filter LP Pools.
        const hasBalance = balance.ticket.hasBalance
        const isLPPool =
          filterAdditionalPools &&
          isRegularPrizePoolBalance &&
          LPPrizePoolAddresses.includes(balance.prizePool.addresses.prizePool)
        const isPOOLPool =
          filterAdditionalPools &&
          isRegularPrizePoolBalance &&
          POOLPoolAddresses.includes(balance.prizePool.addresses.prizePool)

        if (hasBalance && !isLPPool && !isPOOLPool) {
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
