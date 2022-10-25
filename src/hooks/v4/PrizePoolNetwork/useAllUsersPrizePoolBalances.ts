import {
  Token,
  getRefetchInterval,
  getUsersPrizePoolBalancesQueryKey,
  getUsersPrizePoolBalances
} from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQueries, UseQueryResult } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'

/**
 * Fetches all balances for all v4 prize pools provided.
 * @param usersAddress
 * @param prizePools
 * @returns
 */
export const useAllUsersPrizePoolBalances = (usersAddress: string, prizePools: PrizePool[]) => {
  const queryResults = useAllPrizePoolTokens(prizePools)
  return useQueries(
    prizePools.map((prizePool) => {
      const tokenQueryResult = queryResults.find(
        (qr) => qr.data?.prizePoolId === prizePool.id()
      ) as UseQueryResult<
        {
          prizePoolId: string
          ticket: Token
          token: Token
        },
        unknown
      >
      return {
        queryKey: getUsersPrizePoolBalancesQueryKey(usersAddress, prizePool),
        queryFn: async () =>
          getUsersPrizePoolBalances(prizePool, usersAddress, tokenQueryResult?.data),
        enabled: Boolean(prizePool) && Boolean(usersAddress) && tokenQueryResult?.isFetched,
        refetchInterval: getRefetchInterval(prizePool.chainId)
      }
    })
  )
}
