import { NO_REFETCH } from '@constants/query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { useQuery } from 'react-query'
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
  return useQuery(
    ['usePrizePoolNetworkOddsData', totalSupplyData?.totalSupply.amount],
    () => ({
      ...totalSupplyData,
      numberOfPrizes
    }),
    {
      ...NO_REFETCH,
      enabled: isFetched
    }
  )
}
