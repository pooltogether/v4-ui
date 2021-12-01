import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

import { NO_REFETCH } from 'lib/constants/query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Refetches when the draw beacon has updated
 * @returns all of the PrizeDistributions in the PrizeDistributionBuffer for the provided PrizeDistributor
 */
export const useValidPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data: drawIds, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor)
  return useQuery(
    [
      'useValidPrizeDistributions',
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => {
      const validPrizeDistributions = await prizeDistributor.getPrizeDistributions(drawIds)
      return validPrizeDistributions
    },
    { ...NO_REFETCH, enabled }
  )
}
