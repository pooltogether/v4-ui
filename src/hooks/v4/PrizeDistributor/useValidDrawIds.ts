import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

export const VALID_DRAW_IDS_QUERY_KEY = 'useValidDrawIds'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw ids in the DrawBuffer for the provided PrizeDistributor
 */
export const useValidDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = isDrawBeaconFetched && Boolean(prizeDistributor)
  return useQuery(
    [VALID_DRAW_IDS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.drawId],
    async () => getValidDrawIds(prizeDistributor),
    { ...NO_REFETCH, enabled }
  )
}

/**
 * Fetches valid draw ids for the provided prize dsitributor.
 * "Valid draw ids" have both a draw and a prize distribution available in the buffers.
 * @param prizeDistributor
 * @returns
 */
export const getValidDrawIds = async (prizeDistributor: PrizeDistributor) => {
  const drawIds = await prizeDistributor.getValidDrawIds()
  return {
    prizeDistributorId: prizeDistributor.id(),
    drawIds
  }
}
