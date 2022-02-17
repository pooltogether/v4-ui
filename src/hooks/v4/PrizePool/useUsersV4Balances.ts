import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getUsersPrizePoolBalances,
  UsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalances'

export const useUsersV4Balances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const queriesResult = useAllPrizePoolTokens()

  const isAllPrizePoolTokensFetched = queriesResult.every((queryResult) => queryResult.isFetched)

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
        queryFn: async () => {
          const queryResult = queriesResult?.find((queryResult) => {
            const { data: tokens } = queryResult
            return tokens.prizePoolId === prizePool.id()
          })
          const { data: tokens } = queryResult
          return getUsersPrizePoolBalances(prizePool, usersAddress, tokens)
        },
        enabled: isAllPrizePoolTokensFetched
      }
    })
  )

  return useMemo(() => {
    const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
    const isFetching = queryResults.some((queryResult) => queryResult.isFetching)
    const data = queryResults.map((queryResult) => queryResult.data).filter(Boolean)
    const totalValueUsdScaled = getTotalValueUsdScaled(data)
    const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')
    const refetch = () => queryResults.map((queryResult) => queryResult.refetch())
    return {
      isFetched,
      isFetching,
      refetch,
      data: {
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
