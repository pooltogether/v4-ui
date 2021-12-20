import { useQuery } from 'react-query'

import { NO_REFETCH } from 'lib/constants/query'
import { useDrawBeaconPeriod } from './v4/PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizePoolNetwork } from './v4/PrizePoolNetwork/usePrizePoolNetwork'

export const useUpcomingPrizeTier = () => {
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()
  const prizePoolNetwork = usePrizePoolNetwork()
  return useQuery(
    ['useUpcomingPrizeTier', drawBeaconPeriod?.drawId, prizePoolNetwork.id()],
    async () => {
      const prizeTier = await prizePoolNetwork.getUpcomingPrizeTier()
      return prizeTier
    },
    {
      enabled: isFetched,
      ...NO_REFETCH
    }
  )
}
