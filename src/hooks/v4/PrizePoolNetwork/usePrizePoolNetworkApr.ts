import { useUpcomingPrizeConfig } from '@hooks/v4/PrizeDistributor/useUpcomingPrizeConfig'
import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'
import { calculateApr } from '@utils/calculateApr'
import { useSelectedUpcomingPrizeConfig } from '../PrizeDistributor/useSelectedUpcomingPrizeConfig'

/**
 * NOTE: Assumes all networks award the same token.
 * NOTE: Assumes daily prize $ amount is consistent across all networks.
 * @returns
 */
export const usePrizePoolNetworkApr = () => {
  const { data: prizeConfigData, isFetched: isPrizeConfigFetched } =
    useSelectedUpcomingPrizeConfig()
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled = isPrizeConfigFetched && isTotalSupplyFetched && !!prizeConfigData.prizeConfig
  return useQuery(
    ['usePrizePoolNetworkApr', prizeConfigData?.prizeConfig, totalSupplyData],
    () =>
      calculateApr(
        totalSupplyData.totalSupply,
        totalSupplyData.decimals,
        prizeConfigData.prizeConfig.prize
      ),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
