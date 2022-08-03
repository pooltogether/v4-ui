import { useQuery } from 'react-query'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'
import { calculateApr, calculatePercentageOfBigNumber } from '@pooltogether/utilities'

/**
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeConfigFetched } = useUpcomingPrizeTier(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: percentage, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  const enabled =
    isPrizeConfigFetched && isTotalSupplyFetched && !!prizeTierData.prizeTier && isPercentageFetched

  return useQuery(
    ['usePrizePoolApr', prizeTierData?.prizeTier, ticketTwabTotalSupply?.amount],
    () => {
      const scaledDailyPrize = calculatePercentageOfBigNumber(
        prizeTierData.prizeTier.prize,
        percentage.percentage
      )
      return calculateApr(ticketTwabTotalSupply.amount.amountUnformatted, scaledDailyPrize)
    },
    {
      enabled
    }
  )
}
