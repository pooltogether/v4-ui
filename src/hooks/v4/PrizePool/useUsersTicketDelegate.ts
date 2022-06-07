import { NO_REFETCH } from '@constants/query'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const getUserTicketDelegateQueryKey = (prizePool: PrizePool, usersAddress: string) => [
  'getUserTicketDelegate',
  prizePool?.id(),
  usersAddress
]

export const useUsersTicketDelegate = (usersAddress: string, prizePool: PrizePool) => {
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    getUserTicketDelegateQueryKey(prizePool, usersAddress),
    async () => getUserTicketDelegate(usersAddress, prizePool),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

export const getUserTicketDelegate = async (usersAddress: string, prizePool: PrizePool) => {
  const ticketDelegate = await prizePool.getUserTicketDelegate(usersAddress)
  return {
    prizePool,
    usersAddress,
    ticketDelegate
  }
}
