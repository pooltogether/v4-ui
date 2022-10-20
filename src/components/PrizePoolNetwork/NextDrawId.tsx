import { useTimeUntil } from '@hooks/useTimeUntil'
import { useDrawBeaconPeriod } from '@hooks/v4/PrizePoolNetwork/useDrawBeaconPeriod'

export const NextDrawId = () => {
  const { data: drawBeaconPeriod } = useDrawBeaconPeriod()
  const drawId = drawBeaconPeriod?.drawId
  return <>{drawId}</>
}
