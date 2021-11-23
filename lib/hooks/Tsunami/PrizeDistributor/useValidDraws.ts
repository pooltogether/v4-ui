import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

import { NO_REFETCH } from 'lib/constants/query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Refetches when the draw beacon has updated
 * @returns the valid Draws in the DrawBuffer for the provided PrizeDistributor
 */
export const useValidDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data: drawIds, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useValidDraws', prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => {
      const validDraws = await prizeDistributor.getDraws(drawIds)
      console.log('useValidDraws', validDraws)
      return validDraws
    },
    { ...NO_REFETCH, enabled }
  )
}
