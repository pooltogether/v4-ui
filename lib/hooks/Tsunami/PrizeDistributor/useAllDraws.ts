import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the beacon pool on L1
 */
export const useAllDraws = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isLinkedPrizePoolFetched && isDrawBeaconFetched
  return useQuery(
    ['useAllDraws', linkedPrizePool?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => linkedPrizePool.getAllDraws(),
    { ...NO_REFETCH, enabled }
  )
}
