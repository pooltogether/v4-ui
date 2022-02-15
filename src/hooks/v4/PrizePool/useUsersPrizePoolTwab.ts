import { Amount, useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { msToS } from '@pooltogether/utilities'
import { useQuery } from 'react-query'

import { useTicketDecimals } from '@src/hooks/v4/PrizePool/useTicketDecimals'
import { getAmountFromBigNumber } from '@src/utils/getAmountFromBigNumber'

export const USERS_TWAB_QUERY_KEY = 'useUsersPrizePoolTwab'

export const useUsersPrizePoolTwab = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()

  const enabled = Boolean(usersAddress) && isTicketDecimalsFetched

  return useQuery(
    [USERS_TWAB_QUERY_KEY, prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
    {
      refetchInterval,
      enabled
    }
  )
}

export const getUsersPrizePoolTwab = async (
  prizePool: PrizePool,
  usersAddress: string,
  decimals: string
): Promise<{ twab: Amount; usersAddress: string }> => {
  const timestamp = Math.round(msToS(Date.now()))
  const twabUnformatted = await prizePool.getUsersTicketTwabAt(usersAddress, timestamp)

  const twab = getAmountFromBigNumber(twabUnformatted, decimals)

  return {
    usersAddress,
    twab
  }
}
