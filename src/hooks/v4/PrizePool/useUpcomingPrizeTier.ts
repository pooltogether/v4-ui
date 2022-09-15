import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

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
      enabled: isFetched && !!prizePool
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
