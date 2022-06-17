import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'
import { calculateApr } from '@utils/calculateApr'
import { usePrizePoolBySelectedChainId } from '../PrizePool/usePrizePoolBySelectedChainId'
import { useUpcomingPrizeTier } from '../PrizePool/useUpcomingPrizeTier'

/**
 * NOTE: Assumes all networks award the same token.
 * NOTE: Assumes daily prize $ amount is consistent across all networks.
 * @returns
 */
export const usePrizePoolNetworkApr = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: prizeTierData, isFetched: isPrizeConfigFetched } = useUpcomingPrizeTier(prizePool)
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled = isPrizeConfigFetched && isTotalSupplyFetched && !!prizeTierData.prizeTier
  return useQuery(
    ['usePrizePoolNetworkApr', prizeTierData?.prizeTier.prize.toString(), totalSupplyData],
    () =>
      calculateApr(
        totalSupplyData.totalSupply,
        totalSupplyData.decimals,
        prizeTierData?.prizeTier.prize
      ),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
