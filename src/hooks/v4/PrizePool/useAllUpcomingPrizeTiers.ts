import { useQueries } from 'react-query'
import { usePrizeDistributors } from '../PrizeDistributor/usePrizeDistributors'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { getUpcomingPrizeTier, getUpcomingPrizeTierKey } from './useUpcomingPrizeTier'

export const useAllUpcomingPrizeTiers = () => {
  const prizeDistributors = usePrizeDistributors()
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()

  return useQueries(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: getUpcomingPrizeTierKey(drawBeaconPeriod?.drawId, prizeDistributor?.id()),
      enabled: isFetched && !!prizeDistributor,
      queryFn: () => getUpcomingPrizeTier(prizeDistributor)
    }))
  )
}
