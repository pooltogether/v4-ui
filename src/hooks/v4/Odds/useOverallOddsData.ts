import { calculate, PrizeTier } from '@pooltogether/v4-client-js'

import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolNetworkTicketTwabTotalSupply'
import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'

export const useOverallOddsData = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()

  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  const isFetched = isTotalSupplyFetched && isTicketDecimalsFetched && isPrizeTierFetched

  if (!isFetched) {
    return null
  }

  return {
    decimals: ticketDecimals,
    totalSupply: totalSupplyData.totalSupply,
    numberOfPrizes: getNumberOfPrizes(prizeTier)
  }
}

export const getNumberOfPrizes = (prizeTier: PrizeTier) => {
  return prizeTier.tiers.reduce((totalNumberPrizes: number, currentTier: number, index: number) => {
    if (currentTier === 0) return totalNumberPrizes
    return (
      totalNumberPrizes +
      calculate.calculateNumberOfPrizesForTierIndex(prizeTier.bitRangeSize, index)
    )
  }, 0)
}
