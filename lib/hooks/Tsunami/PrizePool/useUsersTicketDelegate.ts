import { PrizePool } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

export const useUsersTicketDelegate = (usersAddress: string, prizePool: PrizePool) => {
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery<{ [usersAddress: string]: string }>(
    ['useUsersTicketDelegate', prizePool?.id(), usersAddress],
    async () => {
      const ticketDelegate = await prizePool.getUsersTicketDelegate(usersAddress)
      return {
        [usersAddress]: ticketDelegate
      }
    },
    {
      enabled
    }
  )
}
