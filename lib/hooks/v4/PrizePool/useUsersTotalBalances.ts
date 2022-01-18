import { useMemo } from 'react'
import { BigNumber } from 'ethers'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useUsersV4Balances } from './useUsersV4Balances'
import { useUsersV3Balances } from 'lib/hooks/v3/useUsersV3Balances'
import { useUsersV3PodBalances } from 'lib/hooks/v3/useUsersV3PodBalances'

// NOTE: Assumes v4 balances are USD stable coins
export const useUsersTotalBalances = () => {
  const usersAddress = useUsersAddress()
  const {
    data: v4BalancesData,
    isFetched: isV4Fetched,
    isFetching: isV4Fetching
  } = useUsersV4Balances(usersAddress)
  const {
    data: v3BalancesData,
    isFetched: isV3Fetched,
    isFetching: isV3Fetching
  } = useUsersV3Balances(usersAddress)
  const {
    data: v3PodBalancesData,
    isFetched: isV3PodsFetched,
    isFetching: isV3PodsFetching
  } = useUsersV3PodBalances(usersAddress)

  return useMemo(() => {
    const v4TotalBalanceUsdScaled = isV4Fetched
      ? v4BalancesData.totalValueUsdScaled
      : BigNumber.from(0)
    const v3TotalBalanceUsdScaled =
      isV3Fetched && isV3PodsFetched
        ? v3BalancesData.totalValueUsdScaled.add(v3PodBalancesData.totalValueUsdScaled)
        : BigNumber.from(0)

    const totalBalanceUsdScaled = v4TotalBalanceUsdScaled.add(v3TotalBalanceUsdScaled)
    const totalBalanceUsd = getAmountFromBigNumber(totalBalanceUsdScaled, '2')
    const totalV4BalanceUsd = getAmountFromBigNumber(v4TotalBalanceUsdScaled, '2')
    const totalV3BalanceUsd = getAmountFromBigNumber(v3TotalBalanceUsdScaled, '2')

    return {
      data: {
        totalV4BalanceUsd,
        totalV3BalanceUsd,
        totalBalanceUsd
      },
      isFetched: isV4Fetched && isV3Fetched && isV3PodsFetched,
      isFetching: isV4Fetching || isV3Fetching || isV3PodsFetching
    }
  }, [v4BalancesData, isV4Fetched, v3BalancesData, isV3Fetched])
}
