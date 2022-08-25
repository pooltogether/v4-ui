import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { sToMs } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQuery } from 'react-query'


/**
 * Fetches a users TWAB between a set of two timestamps
 * @param usersAddress
 * @param prizePool
 * @param startTimestamp
 * @param endTimestamp
 * @returns
 */
export const useUsersPrizePoolTwabBetween = (
  usersAddress: string,
  prizePool: PrizePool,
  startTimestamp: number,
  endTimestamp: number
) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

  const enabled = !!usersAddress && !!startTimestamp && !!endTimestamp && isTicketDecimalsFetched

  return useQuery(
    getUsersPrizePoolTwabBetweenKey(usersAddress, prizePool, startTimestamp),
    async () =>
      getUserPrizePoolTwabBetween(
        prizePool,
        usersAddress,
        ticketDecimals,
        startTimestamp,
        endTimestamp
      ),
    {
      refetchInterval: sToMs(15),
      keepPreviousData: true,
      enabled
    }
  )
}

export const getUsersPrizePoolTwabBetweenKey = (
  usersAddress: string,
  prizePool: PrizePool,
  startTimestamp: number
) => ['useUsersPrizePoolTwab', usersAddress, prizePool?.id(), startTimestamp]

export const getUserPrizePoolTwabBetween = async (
  prizePool: PrizePool,
  usersAddress: string,
  decimals: string,
  startTimestamp: number,
  endTimestamp: number
) => {
  const twabUnformatted = await prizePool.getUsersAverageBalanceBetween(
    usersAddress,
    startTimestamp,
    endTimestamp
  )

  const twab = getAmountFromBigNumber(twabUnformatted, decimals)

  return {
    prizePoolId: prizePool.id(),
    chainId: prizePool.chainId,
    usersAddress,
    twab
  }
}
