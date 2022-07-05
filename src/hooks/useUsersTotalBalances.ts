import { BigNumber, ethers } from 'ethers'

import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useAllUsersV4Balances } from './v4/PrizePool/useAllUsersV4Balances'
import { useUsersV3PrizePoolBalances } from '@hooks/v3/useUsersV3PrizePoolBalances'
import { useUsersV3POOLPoolBalances } from './v3/useUsersV3POOLPoolBalances'
import { useUsersV3LPPoolBalances } from './v3/useUsersV3LPPoolBalances'
import { useQuery } from 'react-query'
import { NO_REFETCH } from '@constants/query'

// NOTE: Assumes v4 balances are USD stable coins
export const useUsersTotalBalances = () => {
  const usersAddress = useUsersAddress()
  const {
    data: v4BalancesData,
    isFetched: isV4Fetched,
    isFetching: isV4Fetching
  } = useAllUsersV4Balances(usersAddress)
  const {
    data: v3BalancesData,
    isFetched: isV3Fetched,
    isFetching: isV3Fetching
  } = useUsersV3PrizePoolBalances(usersAddress)
  const {
    data: v3POOLPoolBalancesData,
    isFetched: isV3POOLPoolFetched,
    isFetching: isV3POOLPoolFetching
  } = useUsersV3POOLPoolBalances(usersAddress)
  const {
    data: v3LPPoolBalances,
    isFetched: isV3LPPoolFetched,
    isFetching: isV3LPPoolFetching
  } = useUsersV3LPPoolBalances(usersAddress)

  return useQuery(
    [
      'useUsersTotalBalances',
      usersAddress,
      v4BalancesData?.balances
        .map((b) => b.balances.ticket.amount + b.balances.token.amount)
        .join('-'),
      v3BalancesData?.balances.map((b) => b.ticket.amount + b.token.amount).join('-'),
      v3POOLPoolBalancesData?.balances.map((b) => b.ticket.amount + b.token.amount).join('-'),
      v3LPPoolBalances?.balances.map((b) => b.ticket.amount + b.token.amount).join('-')
    ],
    () => {
      const v4TotalBalanceUsdScaled = isV4Fetched
        ? v4BalancesData.totalValueUsdScaled
        : ethers.constants.Zero
      const v3TotalBalanceUsdScaled = isV3Fetched
        ? v3BalancesData.totalValueUsdScaled
        : ethers.constants.Zero
      const v3POOLPoolTotalBalanceUsdScaled = isV3POOLPoolFetched
        ? v3POOLPoolBalancesData.totalValueUsdScaled
        : ethers.constants.Zero
      const v3LPPoolTotalBalanceUsdScaled = isV3LPPoolFetched
        ? v3LPPoolBalances.totalValueUsdScaled
        : ethers.constants.Zero

      const totalBalanceUsdScaled = v4TotalBalanceUsdScaled
        .add(v3TotalBalanceUsdScaled)
        .add(v3POOLPoolTotalBalanceUsdScaled)
        .add(v3LPPoolTotalBalanceUsdScaled)
      const totalBalanceUsd = getAmountFromBigNumber(totalBalanceUsdScaled, '2')
      const totalV4BalanceUsd = getAmountFromBigNumber(v4TotalBalanceUsdScaled, '2')
      const totalV3BalanceUsd = getAmountFromBigNumber(v3TotalBalanceUsdScaled, '2')

      // Fallback in case there is no token price data
      const totalV4Balance = v4BalancesData.balances.reduce((total, balance) => {
        if (balance?.balances.ticket.amount) {
          return total + Number(balance.balances.ticket.amount)
        } else {
          return total
        }
      }, 0)

      return {
        data: {
          totalV4Balance,
          totalV4BalanceUsd,
          totalV3BalanceUsd,
          totalBalanceUsd
        },
        isFullyFetched: isV4Fetched && isV3Fetched && isV3POOLPoolFetched && isV3LPPoolFetched,
        isStillFetching: isV4Fetching || isV3Fetching || isV3POOLPoolFetching || isV3LPPoolFetching
      }
    },
    {
      ...NO_REFETCH,
      initialData: {
        data: {
          totalV4Balance: 0,
          totalV4BalanceUsd: getAmountFromBigNumber(ethers.constants.Zero, '2'),
          totalV3BalanceUsd: getAmountFromBigNumber(ethers.constants.Zero, '2'),
          totalBalanceUsd: getAmountFromBigNumber(ethers.constants.Zero, '2')
        },
        isFullyFetched: false,
        isStillFetching: true
      }
    }
  )
}
