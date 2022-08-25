import { calculateApr, calculatePercentageOfBigNumber } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'


/**
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: percentage, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  const enabled =
    isPrizeTierFetched && isTotalSupplyFetched && !!prizeTierData.prizeTier && isPercentageFetched

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
