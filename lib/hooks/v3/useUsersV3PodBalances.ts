import { useMemo } from 'react'
import { BigNumber } from 'ethers'

import { PodBalance, useAllUsersV3PodBalances } from 'lib/hooks/v3/useAllUsersV3PodBalances'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

export const useUsersV3PodBalances = (usersAddress: string) => {
  const queryResults = useAllUsersV3PodBalances(usersAddress)

  return useMemo(() => {
    const { isFetched, data: podBalancesByChainId } = queryResults

    if (!isFetched) {
      return {
        ...queryResults,
        data: null
      }
    }

    const flattenedAndFilteredPodBalances: PodBalance[] = []
    const chainIds = Object.keys(podBalancesByChainId).map(Number)

    chainIds.map((chainId) => {
      const podBalances = podBalancesByChainId[chainId]
      const filteredTickets = podBalances.filter(
        (podBalance) => !podBalance.balance.amountUnformatted.isZero()
      )
      flattenedAndFilteredPodBalances.push(...filteredTickets)
    })

    const totalValueUsdScaled = flattenedAndFilteredPodBalances.reduce(
      (totalValueUsdScaled, podBalance) =>
        totalValueUsdScaled.add(podBalance.balanceValueUsdScaled),
      BigNumber.from(0)
    )
    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')

    return {
      ...queryResults,
      data: {
        balances: flattenedAndFilteredPodBalances,
        totalValueUsdScaled,
        totalValueUsd
      }
    }
  }, [queryResults])
}
