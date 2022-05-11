import { useQueries, UseQueryOptions } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getAvailableDrawIds, AVAILABLE_DRAW_IDS_QUERY_KEY } from './useAvailableDrawIds'

export const useAllAvailableDrawIds = () => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const prizeDistributors = usePrizeDistributors()

  return useQueries<
    UseQueryOptions<{
      prizeDistributorId: string
      drawIds: number[]
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: [AVAILABLE_DRAW_IDS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.drawId],
      queryFn: async () => getAvailableDrawIds(prizeDistributor),
      enabled: isDrawBeaconFetched
    }))
  )
}
