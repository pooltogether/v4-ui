import { usePrizePoolNetworkTicketTwabTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { usePrizePoolNetworkTotalNumberOfPrizes } from '../PrizePoolNetwork/usePrizePoolNetworkTotalNumberOfPrizes'

/**
 *
 * @returns
 */
export const usePrizePoolNetworkOddsData = () => {
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const { data: numberOfPrizes, isFetched: isTotalNumberOfPrizesFetched } =
    usePrizePoolNetworkTotalNumberOfPrizes()

  const isFetched = isTotalSupplyFetched && isTotalNumberOfPrizesFetched
  if (!isFetched) {
    return null
  }

  return {
    ...totalSupplyData,
    numberOfPrizes
  }
}
