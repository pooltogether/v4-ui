import { useQueries, UseQueryOptions } from 'react-query'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getAvailableDrawIds, AVAILABLE_DRAW_IDS_QUERY_KEY } from './useAvailableDrawIds'
import { useSelectedDrawBeaconPeriod } from '../PrizePoolNetwork/useSelectedDrawBeaconPeriod'

export const useAllAvailableDrawIds = () => {
  const { data: drawBeaconPeriodData, isFetched: isDrawBeaconFetched } =
    useSelectedDrawBeaconPeriod()
  const prizeDistributors = usePrizeDistributors()

  return useQueries<
    UseQueryOptions<{
      prizeDistributorId: string
      drawIds: number[]
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: [
        AVAILABLE_DRAW_IDS_QUERY_KEY,
        prizeDistributor?.id(),
        drawBeaconPeriodData?.drawBeaconPeriod.drawId
      ],
      queryFn: async () => getAvailableDrawIds(prizeDistributor),
      enabled: isDrawBeaconFetched
    }))
  )
}
