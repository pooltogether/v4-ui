import { Amount, useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { msToS } from '@pooltogether/utilities'
import { useQuery } from 'react-query'

import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { NO_REFETCH } from '@constants/query'

/**
 * Fetches a users current TWAB
 * @param usersAddress
 * @param prizePool
 * @returns
 */
export const useUsersPrizePoolTwab = (usersAddress: string, prizePool: PrizePool) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

  const enabled = !!usersAddress && isTicketDecimalsFetched

  return useQuery(
    getUsersPrizePoolTwabKey(usersAddress, prizePool),
    async () => getUserPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

export const getUsersPrizePoolTwabKey = (usersAddress: string, prizePool: PrizePool) => [
  'useUsersPrizePoolTwab',
  usersAddress,
  prizePool?.id()
]

export const getUserPrizePoolTwab = async (
  prizePool: PrizePool,
  usersAddress: string,
  decimals: string
) => {
  const timestamp = Math.round(msToS(Date.now()))
  const twabUnformatted = await prizePool.getUsersTicketTwabAt(usersAddress, timestamp)

  const twab = getAmountFromBigNumber(twabUnformatted, decimals)

  return {
    prizePoolId: prizePool.id(),
    chainId: prizePool.chainId,
    usersAddress,
    twab
  }
}
