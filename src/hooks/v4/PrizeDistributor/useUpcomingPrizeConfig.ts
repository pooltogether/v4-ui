import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useDrawBeaconPeriod } from './useDrawBeaconPeriod'

export const getUpcomingPrizeConfigQueryKey = (
  drawId: number,
  prizeDistributor: PrizeDistributorV2
) => ['useUpcomingPrizeConfig', drawId, prizeDistributor?.id()]

export const useUpcomingPrizeConfig = (prizeDistributor: PrizeDistributorV2) => {
  const { data: drawBeaconPeriodData, isFetched } = useDrawBeaconPeriod(prizeDistributor)
  return useQuery(
    getUpcomingPrizeConfigQueryKey(drawBeaconPeriodData?.drawBeaconPeriod.drawId, prizeDistributor),
    async () => getUpcomingPrizeConfig(prizeDistributor),
    {
      enabled: isFetched && !!prizeDistributor,
      ...NO_REFETCH
    }
  )
}

export const getUpcomingPrizeConfig = async (prizeDistributor: PrizeDistributorV2) => {
  {
    try {
      const prizeConfig = await prizeDistributor.getUpcomingPrizeConfig()
      return {
        prizeConfig,
        prizeDistributorId: prizeDistributor.id()
      }
    } catch (e) {
      console.warn(e.message)
      return {
        prizeConfig: null,
        prizeDistributorId: prizeDistributor.id()
      }
    }
  }
}
