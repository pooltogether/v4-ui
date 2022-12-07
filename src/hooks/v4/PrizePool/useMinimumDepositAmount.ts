import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { getAmount } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTicketDecimals } from './usePrizePoolTicketDecimals'

/**
 * @param prizePool
 * @returns
 */
export const useMinimumDepositAmount = (prizePool: PrizePool) => {
  const { data, isFetched, isError } = useUpcomingPrizeTier(prizePool)
  const { data: decimals, isFetched: isDecimalsFetched } = usePrizePoolTicketDecimals(prizePool)
  if (!isDecimalsFetched || !isFetched || isError) return null
  return getAmount(Math.pow(2, data.prizeTier.bitRangeSize).toString(), decimals)
}
