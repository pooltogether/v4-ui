import { useMemo } from 'react'
import { BigNumber } from 'ethers'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useUsersV4Balances } from './useUsersV4Balances'
import { useUsersV3Balances } from 'lib/hooks/v3/useUsersV3Balances'

// NOTE: Assumes v4 balances are USD stable coins
export const useUsersTotalPrizePoolBalances = () => {
  const usersAddress = useUsersAddress()
  const { data: v4BalancesData, isFetched: isV4Fetched } = useUsersV4Balances(usersAddress)
  const { data: v3BalancesData, isFetched: isV3Fetched } = useUsersV3Balances(usersAddress)

  return useMemo(() => {
    const v4TotalBalanceUsdScaled = isV4Fetched
      ? v4BalancesData.totalValueUsdScaled
      : BigNumber.from(0)
    const v3TotalBalanceUsdScaled = isV3Fetched
      ? v3BalancesData.totalValueUsdScaled
      : BigNumber.from(0)

    const totalBalanceUsdScaled = v4TotalBalanceUsdScaled.add(v3TotalBalanceUsdScaled)
    const totalBalanceUsd = getAmountFromBigNumber(totalBalanceUsdScaled, '2')
    const totalV4BalanceUsd = getAmountFromBigNumber(v4TotalBalanceUsdScaled, '2')
    const totalV3BalanceUsd = getAmountFromBigNumber(v3TotalBalanceUsdScaled, '2')

    console.log({
      v4TotalBalanceUsdScaled,
      v3TotalBalanceUsdScaled,
      isV4Fetched,
      isV3Fetched,
      totalBalanceUsdScaled
    })

    return {
      data: {
        totalV4BalanceUsd,
        totalV3BalanceUsd,
        totalBalanceUsd
      },
      isFetched: isV4Fetched && isV3Fetched,
      isFetching: !isV4Fetched || !isV3Fetched
    }
  }, [v4BalancesData, isV4Fetched, v3BalancesData, isV3Fetched])
}
