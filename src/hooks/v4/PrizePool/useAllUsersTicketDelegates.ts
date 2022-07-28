import { useQueries } from 'react-query'
import { NO_REFETCH } from '@constants/query'
import { useAllUsersV4BalancesWithFiat } from '@hooks/v4/PrizePool/useAllUsersV4BalancesWithFiat'
import { getUserTicketDelegate, getUserTicketDelegateQueryKey } from './useUsersTicketDelegate'

/**
 * Fetch users balances for all tokens in all prize pools
 * @param usersAddress
 * @returns
 */
export const useAllUsersTicketDelegates = (usersAddress: string) => {
  const { data, isFetched } = useAllUsersV4BalancesWithFiat(usersAddress)

  const prizePools = isFetched ? data.balances.map((balance) => balance.prizePool) : []

  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: getUserTicketDelegateQueryKey(prizePool, usersAddress),
      queryFn: async () => getUserTicketDelegate(usersAddress, prizePool),
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}
