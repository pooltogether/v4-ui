import { PrizePool } from '@pooltogether/v4-client-js'
import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { NO_REFETCH } from '@constants/query'
import {
  getUsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalances'

export const useAllUsersPrizePoolBalances = (usersAddress: string, prizePools: PrizePool[]) => {
  const queryResults = useAllPrizePoolTokens(prizePools)
  return useQueries(
    prizePools.map((prizePool) => {
      const queryResult = queryResults.find(
        ({ isFetched, data }) => isFetched && data.prizePoolId === prizePool.id()
      )
      return {
        ...NO_REFETCH,
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool?.id(), usersAddress],
        queryFn: async () => getUsersPrizePoolBalances(prizePool, usersAddress, queryResult?.data),
        enabled: !!queryResult && !!usersAddress && !!prizePools
      }
    })
  )
}
