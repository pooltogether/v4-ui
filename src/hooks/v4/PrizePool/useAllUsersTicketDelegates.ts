import { useQueries } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { getPrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useUsersAddress } from '@hooks/useUsersAddress'
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
      ...NO_REFETCH,
      queryKey: getUsersTicketDelegateQueryKey(prizePool, usersAddress),
      queryFn: async () => getUsersTicketDelegate(usersAddress, prizePool),
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}
