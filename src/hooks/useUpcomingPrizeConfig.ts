import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from './v4/PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributorBySelectedChainId } from './v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'

export const useUpcomingPrizeConfig = () => {
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  return useQuery(
    ['useUpcomingPrizeConfig', drawBeaconPeriod?.drawId, prizeDistributor?.id()],
    async () => {
      try {
        const prizeConfig = await prizeDistributor.getUpcomingPrizeConfig()
        return prizeConfig
      } catch (e) {
        return null
      }
    },
    {
      enabled: isFetched && !!prizeDistributor,
      ...NO_REFETCH
    }
  )
}
