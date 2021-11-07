import { calculateNumberOfPrizesForIndex } from '@pooltogether/v4-js-client'
import { Network } from 'lib/constants/network'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { usePrizePoolByNetwork } from './PrizePool/usePrizePoolByNetwork'
import { usePrizePoolTicketTotalSupply } from './PrizePool/usePrizePoolTicketTotalSupply'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'

export const useOverallOddsData = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()

  const ethereumPrizePool = usePrizePoolByNetwork(Network.ethereum)
  const polygonPrizePool = usePrizePoolByNetwork(Network.polygon)

  const { data: ethereumTotalSupplyUnformatted, isFetched: isEthereumTicketTotalSupplyFetched } =
    usePrizePoolTicketTotalSupply(ethereumPrizePool)
  const { data: polygonTotalSupplyUnformatted, isFetched: isPolygonTicketTotalSupplyFetched } =
    usePrizePoolTicketTotalSupply(polygonPrizePool)

  const isFetched = isEthereumTicketTotalSupplyFetched && isPolygonTicketTotalSupplyFetched
  if (!isFetched) {
    return undefined
  }

  const totalSupplyUnformatted = ethereumTotalSupplyUnformatted.add(polygonTotalSupplyUnformatted)

  return {
    decimals: ticketDecimals,
    totalSupply: getAmountFromBigNumber(totalSupplyUnformatted, ticketDecimals),
    numberOfPrizes: getNumberOfPrizes()
  }
}

export const getNumberOfPrizes = () => {
  return TSUNAMI_USDC_PRIZE_DISTRIBUTION.tiers.reduce(
    (totalNumberPrizes: number, currentTier: number, index: number) => {
      if (currentTier === 0) return totalNumberPrizes
      return (
        totalNumberPrizes +
        calculateNumberOfPrizesForIndex(TSUNAMI_USDC_PRIZE_DISTRIBUTION.bitRangeSize, index)
      )
    },
    0
  )
}
