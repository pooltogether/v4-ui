import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getUsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalances'

export const useAllUsersPrizePoolBalances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolTokens()
  return useQueries(
    prizePools.map((prizePool) => {
      const queryResult = queryResults.find(
        ({ isFetched, data }) => isFetched && data.prizePoolId === prizePool.id()
      )
      return {
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool?.id(), usersAddress],
        queryFn: async () => getUsersPrizePoolBalances(prizePool, usersAddress, queryResult?.data),
        enabled: !!queryResult && !!usersAddress && !!prizePools
      }
    })
  )
}
