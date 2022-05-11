import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { useAvailableDrawIds } from './useAvailableDrawIds'

export const AVAILABLE_DRAWS_QUERY_KEY = 'useAvailableDraws'

/**
 * Refetches when the draw beacon has updated
 * Fetches all draw data for all draws that are available in the DrawBuffer
 * @returns the valid Draws in the DrawBuffer for the provided PrizeDistributor
 */
export const useAvailableDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data, isFetched: isDrawIdsFetched } = useAvailableDrawIds(prizeDistributor)
  const drawIds = data?.drawIds
  const enabled =
    isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor) && drawIds.length > 0

  return useQuery(
    [
      AVAILABLE_DRAWS_QUERY_KEY,
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => getAvailableDraws(prizeDistributor, drawIds),
    { ...NO_REFETCH, enabled }
  )
}

export const getAvailableDraws = async (prizeDistributor: PrizeDistributor, drawIds: number[]) => {
  const draws = await prizeDistributor.getDraws(drawIds)
  return {
    prizeDistributorId: prizeDistributor.id(),
    draws
  }
}
