import { getRefetchInterval } from '@pooltogether/hooks'
import { useQueries } from 'react-query'

import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { usePrizePools } from './usePrizePools'
import { getUserPrizePoolTwab, getUsersPrizePoolTwabKey } from './useUsersPrizePoolTwab'
import { NO_REFETCH } from '@constants/query'

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
        ...NO_REFETCH,
        queryKey: getUsersPrizePoolTwabKey(usersAddress, prizePool),
        queryFn: async () => getUserPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
        enabled: !!usersAddress && isTicketDecimalsFetched
      }
    })
  )
}
