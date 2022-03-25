import { Amount, useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { msToS } from '@pooltogether/utilities'
import { useQuery } from 'react-query'

import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

export const USERS_TWAB_QUERY_KEY = 'useUsersPrizePoolTwab'

/**
 * Fetches a users current TWAB
 * @param usersAddress
 * @param prizePool
 * @returns
 */
export const useUsersPrizePoolTwab = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

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
): Promise<{ chainId: number; twab: Amount; usersAddress: string }> => {
  const timestamp = Math.round(msToS(Date.now()))
  const twabUnformatted = await prizePool.getUsersTicketTwabAt(usersAddress, timestamp)

  const twab = getAmountFromBigNumber(twabUnformatted, decimals)

  return {
    chainId: prizePool.chainId,
    usersAddress,
    twab
  }
}
