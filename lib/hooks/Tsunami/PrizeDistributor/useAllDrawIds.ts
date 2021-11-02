import { NO_REFETCH } from 'lib/constants/query'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the beacon pool on L1
 */
export const useAllDrawIds = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isLinkedPrizePoolFetched && isDrawBeaconFetched
  return useQuery(
    ['useAllDrawIds', linkedPrizePool?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    () => linkedPrizePool.getAllDrawIds(),
    { ...NO_REFETCH, enabled }
  )
}
