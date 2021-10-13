import { PrizePool } from '@pooltogether/v4-js-client'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useQuery } from 'react-query'

export const useUsersTicketDelegate = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    ['useUsersTicketDelegate', prizePool?.id(), usersAddress],
    async () => await prizePool.getUsersTicketDelegate(usersAddress),
    {
      enabled
    }
  )
}
