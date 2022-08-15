import { Draw } from '@pooltogether/v4-client-js'
import { useQueries, UseQueryOptions } from 'react-query'
import { useAllAvailableDrawIds } from './useAllAvailableDrawIds'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getAvailableDraws, AVAILABLE_DRAWS_QUERY_KEY } from './useAvailableDraws'
import { useSelectedDrawBeaconPeriod } from '../PrizePoolNetwork/useSelectedDrawBeaconPeriod'

export const useAllAvailableDraws = () => {
  const drawIdsQueryResults = useAllAvailableDrawIds()
  const { data: drawBeaconPeriodData, isFetched: isDrawBeaconFetched } =
    useSelectedDrawBeaconPeriod()
  const prizeDistributors = usePrizeDistributors()

  return useQueries<
    UseQueryOptions<{
      prizeDistributorId: string
      draws: {
        [drawId: number]: Draw
      }
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => {
      const drawIdsQueryResult = drawIdsQueryResults.find((queryResult) => {
        const { data, isFetched } = queryResult
        if (!isFetched) return false
        return data.prizeDistributorId === prizeDistributor.id()
      })
      const isDrawIdsFetched = Boolean(drawIdsQueryResult) && drawIdsQueryResult.isFetched
      const drawIds = drawIdsQueryResult?.data.drawIds

      return {
        queryKey: [
          AVAILABLE_DRAWS_QUERY_KEY,
          prizeDistributor?.id(),
          drawBeaconPeriodData?.drawBeaconPeriod.drawId
        ],
        queryFn: async () => getAvailableDraws(prizeDistributor, drawIds),
        enabled: isDrawBeaconFetched && isDrawIdsFetched
      }
    })
  )
}
