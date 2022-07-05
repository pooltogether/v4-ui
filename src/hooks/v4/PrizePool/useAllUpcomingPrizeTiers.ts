import { NO_REFETCH } from '@constants/query'
import { useQueries } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizePools } from './usePrizePools'
import { getUpcomingPrizeTier, getUpcomingPrizeTierKey } from './useUpcomingPrizeTier'

export const useAllUpcomingPrizeTiers = () => {
  const prizePools = usePrizePools()
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()

  return useQueries(
    prizePools.map((prizePool) => ({
      ...NO_REFETCH,
      queryKey: getUpcomingPrizeTierKey(drawBeaconPeriod?.drawId, prizePool?.id()),
      enabled: isFetched && !!prizePool,
      queryFn: () => getUpcomingPrizeTier(prizePool)
    }))
  )
}
