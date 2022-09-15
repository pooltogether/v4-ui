import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { useAllTwabDelegations } from '../TwabDelegator/useAllTwabDelegations'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getUsersPrizePoolBalances,
  UsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalances'

export const useAllUsersV4Balances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const queriesResult = useAllPrizePoolTokens()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      const queryResult = queriesResult?.find((queryResult) => {
        const { data: tokens } = queryResult
        return tokens.prizePoolId === prizePool.id()
      })
      return {
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
        queryFn: async () => {
          const { data: tokens } = queryResult
          return getUsersPrizePoolBalances(prizePool, usersAddress, tokens)
        },
        enabled: queryResult?.isFetched && !!usersAddress
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
    const totalDelegationValueUsdScaled = isDelegationsFetched
      ? delegationData?.totalTokenWithUsdBalance.balanceUsdScaled
      : BigNumber.from(0)
    const totalValueUsdScaled = totalDelegationValueUsdScaled
      ? totalTicketValueUsdScaled.add(totalDelegationValueUsdScaled)
      : BigNumber.from(0)
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
        delegations: isDelegationsFetched ? delegationData?.delegations : null,
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

    const { balances } = balanceData
    // NOTE: Assumes stablecoins
    const valueUsdScaled = toScaledUsdBigNumber(balances.ticket.amount)
    totalValueUsdScaled = totalValueUsdScaled.add(valueUsdScaled)
  })

  return totalValueUsdScaled
}
