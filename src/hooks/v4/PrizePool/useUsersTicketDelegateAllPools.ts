import { useQueries } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useUsersV4Balances } from '@hooks/v4/PrizePool/useUsersV4Balances'
import { useUsersAddress } from '@hooks/useUsersAddress'

/**
 * Fetch users balances for all tokens in all prize pools
 * @param usersAddress
 * @returns
 */
export const useUsersTicketDelegateAllPools = () => {
  const usersAddress = useUsersAddress()

  const { data, isFetched } = useUsersV4Balances(usersAddress)

  const prizePools = isFetched ? data.balances.map((balance) => balance.prizePool) : []

  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: ['useUsersTicketDelegateAllPools', usersAddress, prizePool.id()],
      queryFn: async () => {
        const ticketDelegate = await prizePool.getUsersTicketDelegate(usersAddress)
        const ticketData = await prizePool.getUsersPrizePoolBalances(usersAddress)
        return {
          prizePool,
          ticketData,
          [usersAddress]: ticketDelegate
        }
      },
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}
