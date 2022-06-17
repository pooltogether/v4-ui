import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { PrizePool } from '@pooltogether/v4-client-js'

export const getUpcomingPrizeTierKey = (drawBeaconPeriodDrawId: number, prizePoolId: string) => [
  'useUpcomingPrizeTier',
  drawBeaconPeriodDrawId,
  prizePoolId
]

export const useUpcomingPrizeTier = (prizePool: PrizePool) => {
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()
  return useQuery(
    getUpcomingPrizeTierKey(drawBeaconPeriod?.drawId, prizePool?.id()),
    () => getUpcomingPrizeTier(prizePool),
    {
      enabled: isFetched && !!prizePool,
      ...NO_REFETCH
    }
  )
}

export const getUpcomingPrizeTier = async (prizePool: PrizePool) => {
  const prizeTier = await prizePool.getUpcomingPrizeTier()
  return {
    prizeTier,
    prizePoolId: prizePool.id()
  }
}
