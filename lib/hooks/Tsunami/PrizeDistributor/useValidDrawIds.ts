import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

import { NO_REFETCH } from 'lib/constants/query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the provided PrizeDistributor
 */
export const useValidDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isDrawBeaconFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useValidDrawIds', prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => {
      const validDrawIds = await prizeDistributor.getValidDrawIds()
      console.log('useValidDrawIds', validDrawIds)
      return validDrawIds
    },
    { ...NO_REFETCH, enabled }
  )
}
