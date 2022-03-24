import { useQueries } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useUsersV4Balances } from '@hooks/v4/PrizePool/useUsersV4Balances'
import { getPrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
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
        const tokens = await getPrizePoolTokens(prizePool)
        const delegate = await prizePool.getUsersTicketDelegate(usersAddress)
        const prizePoolBalances = await prizePool.getUsersPrizePoolBalances(usersAddress)
        return {
          chainId: prizePool.chainId,
          ticketDecimals: tokens.ticket.decimals,
          prizePool,
          prizePoolBalances,
          delegate,
          usersAddress
        }
      },
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}
