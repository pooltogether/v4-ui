import { sToMs } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

/**
 * Fetches a users TWAB at a specific timestamp
 * @param usersAddress
 * @param prizePool
 * @param timestamp
 * @returns
 */
export const useUsersPrizePoolTwabAtTimestamp = (
  usersAddress: string,
  prizePool: PrizePool,
  timestamp: number
) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

  const enabled = !!usersAddress && !!timestamp && isTicketDecimalsFetched

  return useQuery(
    getUsersPrizePoolTwabAtTimestampKey(usersAddress, prizePool, timestamp),
    async () => getUserPrizePoolTwabAtTimestamp(prizePool, usersAddress, ticketDecimals, timestamp),
    {
      refetchInterval: sToMs(60),
      enabled
    }
  )
}

export const getUsersPrizePoolTwabAtTimestampKey = (
  usersAddress: string,
  prizePool: PrizePool,
  timestamp: number
) => ['useUsersPrizePoolTwab', usersAddress, prizePool?.id(), timestamp]

export const getUserPrizePoolTwabAtTimestamp = async (
  prizePool: PrizePool,
  usersAddress: string,
  decimals: string,
  timestamp: number
) => {
  const twabUnformatted = await prizePool.getUsersTicketTwabAt(usersAddress, timestamp)

  const twab = getAmountFromBigNumber(twabUnformatted, decimals)

  return {
    prizePoolId: prizePool.id(),
    chainId: prizePool.chainId,
    usersAddress,
    twab
  }
}
