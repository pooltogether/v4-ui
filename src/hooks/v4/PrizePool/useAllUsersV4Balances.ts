import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import {
  formatCurrencyNumberForDisplay,
  getAmount,
  toScaledUsdBigNumber
} from '@pooltogether/utilities'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useAllUsersPrizePoolBalances } from '../PrizePoolNetwork/useAllUsersPrizePoolBalances'
import { useAllTwabDelegations } from '../TwabDelegator/useAllTwabDelegations'
import { usePrizePools } from './usePrizePools'

/**
 * TODO: Properly add fiat conversions
 * @param usersAddress
 * @returns
 */
export const useAllUsersV4Balances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const queryResults = useAllUsersPrizePoolBalances(usersAddress, prizePools)

  const {
    data: delegationData,
    isFetched: isDelegationsFetched,
    isError: isDelegationsError,
    isFetching: isDelegationsFetching,
    refetch: refetchDelegations
  } = useAllTwabDelegations(usersAddress)

  return useMemo(() => {
    const isFetched =
      queryResults.every((queryResult) => queryResult.isFetched && !queryResult.isError) &&
      isDelegationsFetched &&
      !isDelegationsError
    const isFetching =
      queryResults.some((queryResult) => queryResult.isFetching) || isDelegationsFetching
    const data = queryResults
      .map((queryResult) => queryResult.data)
      .filter(Boolean)
      .map((data) => {
        const ticket = {
          ...data.balances.ticket,
          balanceUsd: getAmount(data.balances.ticket.amount, data.balances.ticket.decimals, {
            style: 'currency',
            currency: 'USD'
          })
        }
        const token = {
          ...data.balances.token,
          balanceUsd: getAmount(data.balances.token.amount, data.balances.token.decimals, {
            style: 'currency',
            currency: 'USD'
          })
        }
        data.balances.ticket = ticket
        data.balances.token = token
        return data
      })
    const totalTicketValueUsdScaled = getTotalValueUsdScaled(data)
    const totalDelegationValueUsdScaled =
      isDelegationsFetched && !isDelegationsError
        ? delegationData?.totalTokenWithUsdBalance.balanceUsdScaled
        : BigNumber.from(0)
    const totalValueUsdScaled = totalDelegationValueUsdScaled
      ? totalTicketValueUsdScaled.add(totalDelegationValueUsdScaled)
      : BigNumber.from(0)
    const totalValueUsd = getAmountFromUnformatted(totalValueUsdScaled, '2')
    const refetch = () => {
      queryResults.map((queryResult) => queryResult.refetch())
      refetchDelegations()
    }

    return {
      isFetched,
      isFetching,
      refetch,
      data: {
        delegations:
          isDelegationsFetched && !isDelegationsError ? delegationData?.delegations : null,
        balances: data,
        totalValueUsd,
        totalValueUsdScaled
      }
    }
  }, [
    delegationData?.delegations,
    delegationData?.totalTokenWithUsdBalance.balanceUsdScaled,
    isDelegationsFetched,
    isDelegationsFetching,
    queryResults,
    refetchDelegations
  ])
}

const getTotalValueUsdScaled = (
  data: {
    prizePool: PrizePool
    usersAddress: string
    balances: {
      ticket: TokenWithBalance
      token: TokenWithBalance
    }
  }[]
) => {
  let totalValueUsdScaled = BigNumber.from(0)

  data?.forEach((balanceData) => {
    if (!balanceData) return

    // NOTE: Assumes stablecoins
    const valueUsdScaled = toScaledUsdBigNumber(balanceData.balances.ticket.amount)
    totalValueUsdScaled = totalValueUsdScaled.add(valueUsdScaled)
  })

  return totalValueUsdScaled
}
