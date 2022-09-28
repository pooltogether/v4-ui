import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
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
  const drawIds = data?.drawIds
  const enabled = isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor)

  return useQuery(
    [VALID_DRAWS_QUERY_KEY, prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => getValidDraws(prizeDistributor, drawIds),
    { enabled }
  )
}

export const getValidDraws = async (prizeDistributor: PrizeDistributor, drawIds: number[]) => {
  if (drawIds.length > 0) {
    const draws = await prizeDistributor.getDraws(drawIds)
    return {
      prizeDistributorId: prizeDistributor.id(),
      draws
    }
  } else {
    return {
      prizeDistributorId: prizeDistributor.id(),
      draws: {}
    }
  }
}
