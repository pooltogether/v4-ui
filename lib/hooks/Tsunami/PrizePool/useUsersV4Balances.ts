import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getUsersPrizePoolBalances,
  USERS_PRIZE_POOL_BALANCES_QUERY_KEY
} from './useUsersPrizePoolBalances'

export const useUsersV4Balances = (usersAddress: string) => {
  const prizePools = usePrizePools()
  const allPrizePoolTokens = useAllPrizePoolTokens()

  const isAllPrizePoolTokensFetched = allPrizePoolTokens.every(
    (queryResult) => queryResult.isFetched
  )

  return useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
        queryFn: async () => {
          const queryResult = allPrizePoolTokens?.find((queryResult) => {
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
}
