import { sToMs } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { msToS } from '@pooltogether/utilities'
import { useQueries, useQuery } from 'react-query'

import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { usePrizePools } from './usePrizePools'

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
      refetchInterval: sToMs(60),
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

/**
 * Fetches the users current TWAB across all chains
 * NOTE: Assumes all prize pool tickets have the same decimals
 * @param usersAddress
 * @returns
 */
export const useAllUsersPrizePoolTwabs = (usersAddress: string) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()
  const prizePools = usePrizePools()

  return useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: getUsersPrizePoolTwabKey(usersAddress, prizePool),
        queryFn: async () => getUserPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
        enabled: !!usersAddress && isTicketDecimalsFetched
      }
    })
  )
}
