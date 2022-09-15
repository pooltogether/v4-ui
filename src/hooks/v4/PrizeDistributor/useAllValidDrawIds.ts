import { useQueries, UseQueryOptions } from 'react-query'

import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getValidDrawIds, VALID_DRAW_IDS_QUERY_KEY } from './useValidDrawIds'

export const useAllValidDrawIds = () => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const prizeDistributors = usePrizeDistributors()

  return useQueries<
    UseQueryOptions<{
      prizeDistributorId: string
      drawIds: number[]
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: [VALID_DRAW_IDS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.drawId],
      queryFn: async () => getValidDrawIds(prizeDistributor),
      enabled: isDrawBeaconFetched
    }))
  )
}
