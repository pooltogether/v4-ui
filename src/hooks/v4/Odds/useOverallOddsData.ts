import { calculate, PrizeConfig } from '@pooltogether/v4-client-js'

import { useUpcomingPrizeConfig } from '@hooks/useUpcomingPrizeConfig'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolNetworkTicketTwabTotalSupply'
import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'

export const useOverallOddsData = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()
  const { data: prizeConfig, isFetched: isPrizeConfigFetched } = useUpcomingPrizeConfig()

  const { data: totalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  const isFetched =
    isTotalSupplyFetched && isTicketDecimalsFetched && isPrizeConfigFetched && !!prizeConfig

  if (!isFetched) {
    return null
  }

  return {
    decimals: ticketDecimals,
    totalSupply,
    numberOfPrizes: getNumberOfPrizes(prizeConfig)
  }
}

export const getNumberOfPrizes = (prizeConfig: PrizeConfig) => {
  return prizeConfig.tiers.reduce(
    (totalNumberPrizes: number, currentTier: number, index: number) => {
      if (currentTier === 0) return totalNumberPrizes
      return (
        totalNumberPrizes +
        calculate.calculateNumberOfPrizesForTierIndex(prizeConfig.bitRangeSize, index)
      )
    },
    0
  )
}
