import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { calculateApr } from '@utils/calculateApr'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'
import { percentageOfBigNumber } from '@utils/percentageOfBigNumber'

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
      const scaledDailyPrize = percentageOfBigNumber(prizeTierData.prizeTier.prize, percentage)
      return calculateApr(ticketTwabTotalSupply.amount.amountUnformatted, scaledDailyPrize)
    },
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
