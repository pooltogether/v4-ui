import { NO_REFETCH } from '@constants/query'
import { useQueries } from 'react-query'
import { useAllDrawBeaconPeriods } from './useAllDrawBeaconPeriods'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getUpcomingPrizeConfigQueryKey, getUpcomingPrizeConfig } from './useUpcomingPrizeConfig'

export const useAllUpcomingPrizeConfigs = () => {
  const prizeDistributors = usePrizeDistributors()
  const allDrawBeaconPeriodsQueryResults = useAllDrawBeaconPeriods()
  const isAllDrawBeaconPeriodsFetched = allDrawBeaconPeriodsQueryResults.every(
    (queryResults) => queryResults.isFetched
  )

  return useQueries(
    prizeDistributors.map((prizeDistributor) => {
      const queryResult = allDrawBeaconPeriodsQueryResults.find(
        (queryResults) => queryResults?.data?.prizeDistributorId === prizeDistributor.id()
      )
      return {
        ...NO_REFETCH,
        queryKey: getUpcomingPrizeConfigQueryKey(
          queryResult?.data?.drawBeaconPeriod.drawId,
          prizeDistributor
        ),
        enabled: isAllDrawBeaconPeriodsFetched,
        queryFn: () => getUpcomingPrizeConfig(prizeDistributor)
      }
    })
  )
}
