import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the provided PrizeDistributor
 */
export const useValidDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isDrawBeaconFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useValidDrawIds', prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    () => prizeDistributor.getValidDrawIds(),
    { ...NO_REFETCH, enabled }
  )
}
