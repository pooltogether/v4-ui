import { NO_REFETCH } from '@constants/query'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const getUsersTicketDelegateQueryKey = (prizePool: PrizePool, usersAddress: string) => [
  'getUsersTicketDelegate',
  prizePool?.id(),
  usersAddress
]

export const useUsersTicketDelegate = (usersAddress: string, prizePool: PrizePool) => {
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    getUsersTicketDelegateQueryKey(prizePool, usersAddress),
    async () => getUsersTicketDelegate(usersAddress, prizePool),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

export const getUsersTicketDelegate = async (usersAddress: string, prizePool: PrizePool) => {
  const ticketDelegate = await prizePool.getUsersTicketDelegate(usersAddress)
  return {
    prizePool,
    usersAddress,
    ticketDelegate
  }
}
