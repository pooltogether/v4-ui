import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

export const AVAILABLE_DRAW_IDS_QUERY_KEY = 'useAvailableDrawIds'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the provided PrizeDistributor
 */
export const useAvailableDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isDrawBeaconFetched && Boolean(prizeDistributor)
  return useQuery(
    [AVAILABLE_DRAW_IDS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.drawId],
    async () => getAvailableDrawIds(prizeDistributor),
    { ...NO_REFETCH, enabled }
  )
}

/**
 * Fetches available draw ids for the provided prize dsitributor.
 * "Available draw ids" have a draw in the buffer.
 * @param prizeDistributor
 * @returns
 */
export const getAvailableDrawIds = async (prizeDistributor: PrizeDistributor) => {
  const drawIds = await prizeDistributor.getAvailableDrawIds()
  return {
    prizeDistributorId: prizeDistributor.id(),
    drawIds
  }
}
