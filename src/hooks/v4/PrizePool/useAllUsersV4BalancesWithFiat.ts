import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { usePrizePools } from './usePrizePools'
import {
  getUsersPrizePoolBalances,
  UsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalancesWithFiat'
import { useAllTwabDelegations } from '../TwabDelegator/useAllTwabDelegations'
import { NO_REFETCH } from '@constants/query'
import { useAllUsersPrizePoolBalances } from './useAllUsersPrizePoolBalances'

export const useAllUsersV4BalancesWithFiat = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const prizePoolBalancesQueryResults = useAllUsersPrizePoolBalances(usersAddress, prizePools)

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      const queryResult = prizePoolBalancesQueryResults?.find(({ isFetched, data }) => {
        return isFetched && data.prizePoolId === prizePool.id()
      })
      return {
        ...NO_REFETCH,
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
        queryFn: async () => {
          return getUsersPrizePoolBalances(prizePool, usersAddress, queryResult.data.balances)
        },
        enabled: !!queryResult && queryResult.isFetched && !!usersAddress
      }
    })
  )

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
    // TODO: Delegations are messing up.
    // const totalDelegationValueUsdScaled = isDelegationsFetched
    //   ? delegationData.totalTokenWithUsdBalance.balanceUsdScaled
    //   : BigNumber.from(0)
    const totalValueUsdScaled = totalTicketValueUsdScaled //.add(totalDelegationValueUsdScaled)
    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')
    const refetch = () => {
      queryResults.map((queryResult) => queryResult.refetch())
      refetchDelegations()
    }
    return {
      isFetched,
      isFetching,
      refetch,
      data: {
        delegations: null, //isDelegationsFetched ? delegationData.delegations : null,
        balances: data,
        totalValueUsd,
        totalValueUsdScaled
      }
    }
  }, [queryResults])
}

const getTotalValueUsdScaled = (
  data: {
    prizePool: PrizePool
    usersAddress: string
    balances: UsersPrizePoolBalances
  }[]
) => {
  let totalValueUsdScaled = BigNumber.from(0)

  data.forEach((balanceData) => {
    if (!balanceData) return

    const { prizePool, balances } = balanceData
    // NOTE: Assumes stablecoins
    const valueUsdScaled = toScaledUsdBigNumber(balances.ticket.amount)
    totalValueUsdScaled = totalValueUsdScaled.add(valueUsdScaled)
  })

  return totalValueUsdScaled
}
