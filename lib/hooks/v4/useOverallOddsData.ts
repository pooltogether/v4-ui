import { calculateNumberOfPrizesForIndex, PrizeTier } from '@pooltogether/v4-js-client'

import { useUpcomingPrizeTier } from '../useUpcomingPrizeTier'
import { usePrizePoolNetworkTicketTotalSupply } from './PrizePool/usePrizePoolNetworkTicketTotalSupply'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'

export const useOverallOddsData = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()

  const { data: totalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTotalSupply()

  const isFetched = isTotalSupplyFetched && isTicketDecimalsFetched && isPrizeTierFetched

  if (!isFetched) {
    return null
  }

  return {
    decimals: ticketDecimals,
    totalSupply,
    numberOfPrizes: getNumberOfPrizes(prizeTier)
  }
}

export const getNumberOfPrizes = (prizeTier: PrizeTier) => {
  return prizeTier.tiers.reduce((totalNumberPrizes: number, currentTier: number, index: number) => {
    if (currentTier === 0) return totalNumberPrizes
    return totalNumberPrizes + calculateNumberOfPrizesForIndex(prizeTier.bitRangeSize, index)
  }, 0)
}
