import { usePrizePoolNetworkTotalAmountOfPrizes } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTotalAmountOfPrizes'
import { numberWithCommas } from '@pooltogether/utilities'

/**
 * TODO: Actually get token prices
 * @param props
 * @returns
 */
export const TotalNumberOfPrizes = (props) => {
  const { data, isFetched } = usePrizePoolNetworkTotalAmountOfPrizes()
  return isFetched ? <>{numberWithCommas(data?.totalAmountOfPrizes, { precision: 0 })}</> : null
}
