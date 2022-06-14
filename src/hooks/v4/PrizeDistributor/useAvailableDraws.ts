import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useAvailableDrawIds } from './useAvailableDrawIds'
import { useSelectedDrawBeaconPeriod } from '../PrizePoolNetwork/useSelectedDrawBeaconPeriod'

export const AVAILABLE_DRAWS_QUERY_KEY = 'useAvailableDraws'

/**
 * Refetches when the draw beacon has updated
 * Fetches all draw data for all draws that are available in the DrawBuffer
 * @returns the valid Draws in the DrawBuffer for the provided PrizeDistributorV2
 */
export const useAvailableDraws = (prizeDistributor: PrizeDistributorV2) => {
  const { data: drawBeaconPeriodData, isFetched: isDrawBeaconFetched } =
    useSelectedDrawBeaconPeriod()
  const { data, isFetched: isDrawIdsFetched } = useAvailableDrawIds(prizeDistributor)
  const drawIds = data?.drawIds
  const enabled =
    isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor) && drawIds.length > 0

  return useQuery(
    [
      AVAILABLE_DRAWS_QUERY_KEY,
      prizeDistributor?.id(),
      drawBeaconPeriodData?.drawBeaconPeriod.startedAtSeconds.toString()
    ],
    async () => getAvailableDraws(prizeDistributor, drawIds),
    { ...NO_REFETCH, enabled }
  )
}

export const getAvailableDraws = async (
  prizeDistributor: PrizeDistributorV2,
  drawIds: number[]
) => {
  const draws = await prizeDistributor.getDraws(drawIds)
  return {
    prizeDistributorId: prizeDistributor.id(),
    draws
  }
}
