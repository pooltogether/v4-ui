import { calculateNumberOfPrizesForIndex, PrizeTier } from '@pooltogether/v4-js-client'

import { Network } from 'lib/constants/config'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useUpcomingPrizeTier } from '../useUpcomingPrizeTier'
import { usePrizePoolByNetwork } from './PrizePool/usePrizePoolByNetwork'
import { usePrizePoolTicketTotalSupply } from './PrizePool/usePrizePoolTicketTotalSupply'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'

export const useOverallOddsData = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()

  const ethereumPrizePool = usePrizePoolByNetwork(Network.ethereum)
  const polygonPrizePool = usePrizePoolByNetwork(Network.polygon)

  const { data: ethereumTotalSupplyUnformatted, isFetched: isEthereumTicketTotalSupplyFetched } =
    usePrizePoolTicketTotalSupply(ethereumPrizePool)
  const { data: polygonTotalSupplyUnformatted, isFetched: isPolygonTicketTotalSupplyFetched } =
    usePrizePoolTicketTotalSupply(polygonPrizePool)

  const isFetched =
    isEthereumTicketTotalSupplyFetched &&
    isPolygonTicketTotalSupplyFetched &&
    isTicketDecimalsFetched &&
    isPrizeTierFetched

  if (!isFetched) {
    return null
  }

  const totalSupplyUnformatted = ethereumTotalSupplyUnformatted.add(polygonTotalSupplyUnformatted)

  return {
    decimals: ticketDecimals,
    totalSupply: getAmountFromBigNumber(totalSupplyUnformatted, ticketDecimals),
    numberOfPrizes: getNumberOfPrizes(prizeTier)
  }
}

export const getNumberOfPrizes = (prizeTier: PrizeTier) => {
  return prizeTier.tiers.reduce((totalNumberPrizes: number, currentTier: number, index: number) => {
    if (currentTier === 0) return totalNumberPrizes
    return totalNumberPrizes + calculateNumberOfPrizesForIndex(prizeTier.bitRangeSize, index)
  }, 0)
}
