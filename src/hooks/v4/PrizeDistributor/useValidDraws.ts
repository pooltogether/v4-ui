import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { useValidDrawIds } from './useValidDrawIds'

export const VALID_DRAWS_QUERY_KEY = 'useValidDraws'

/**
 * Refetches when the draw beacon has updated
 * @returns the valid Draws in the DrawBuffer for the provided PrizeDistributor
 */
export const useValidDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor)
  const drawIds = data?.drawIds

  return useQuery(
    [VALID_DRAWS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => getValidDraws(prizeDistributor, drawIds),
    { ...NO_REFETCH, enabled }
  )
}

export const getValidDraws = async (prizeDistributor: PrizeDistributor, drawIds: number[]) => {
  const draws = await prizeDistributor.getDraws(drawIds)
  return {
    prizeDistributorId: prizeDistributor.id(),
    draws
  }
}
