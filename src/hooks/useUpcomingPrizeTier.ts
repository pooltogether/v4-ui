import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from './v4/PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributorBySelectedChainId } from './v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'

export const useUpcomingPrizeTier = () => {
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  return useQuery(
    ['useUpcomingPrizeTier', drawBeaconPeriod?.drawId, prizeDistributor?.id()],
    async () => {
      try {
        const prizeTier = await prizeDistributor.getUpcomingPrizeTier()
        return prizeTier
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
