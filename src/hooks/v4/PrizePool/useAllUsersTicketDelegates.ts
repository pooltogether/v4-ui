import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { useQueries } from 'react-query'

import { getUsersTicketDelegate, getUsersTicketDelegateQueryKey } from './useUsersTicketDelegate'

/**
 * Fetch users balances for all tokens in all prize pools
 * @param usersAddress
 * @returns
 */
export const useAllUsersTicketDelegates = (usersAddress: string) => {
  const { data, isFetched } = useAllUsersV4Balances(usersAddress)

  const prizePools = isFetched ? data.balances.map((balance) => balance.prizePool) : []

  return useQueries(
    prizePools.map((prizePool) => ({
      queryKey: getUsersTicketDelegateQueryKey(prizePool, usersAddress),
      queryFn: async () => getUsersTicketDelegate(usersAddress, prizePool),
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}
