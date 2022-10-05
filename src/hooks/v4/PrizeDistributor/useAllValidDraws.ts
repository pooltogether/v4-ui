import { Draw } from '@pooltogether/v4-client-js'
import { useQueries, UseQueryOptions } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { useAllValidDrawIds } from './useAllValidDrawIds'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getValidDraws, VALID_DRAWS_QUERY_KEY } from './useValidDraws'

export const useAllValidDraws = () => {
  const drawIdsQueryResults = useAllValidDrawIds()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
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
        queryKey: [VALID_DRAWS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.drawId],
        queryFn: async () => getValidDraws(prizeDistributor, drawIds),
        enabled: isDrawBeaconFetched && isDrawIdsFetched
      }
    })
  )
}
