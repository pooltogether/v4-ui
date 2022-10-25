import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useAllUsersPrizePoolBalances } from '../PrizePoolNetwork/useAllUsersPrizePoolBalances'
import { useAllTwabDelegations } from '../TwabDelegator/useAllTwabDelegations'
import { usePrizePools } from './usePrizePools'

export const useAllUsersV4Balances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const queryResults = useAllUsersPrizePoolBalances(usersAddress, prizePools)

  const {
    data: delegationData,
    isFetched: isDelegationsFetched,
    isFetching: isDelegationsFetching,
    refetch: refetchDelegations
  } = useAllTwabDelegations(usersAddress)

  return useMemo(() => {
    const isFetched =
      queryResults.every((queryResult) => queryResult.isFetched) && isDelegationsFetched
    const isFetching =
      queryResults.some((queryResult) => queryResult.isFetching) || isDelegationsFetching
    const data = queryResults.map((queryResult) => queryResult.data).filter(Boolean)
    const totalTicketValueUsdScaled = getTotalValueUsdScaled(data)
    const totalDelegationValueUsdScaled = isDelegationsFetched
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
        delegations: isDelegationsFetched ? delegationData?.delegations : null,
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
