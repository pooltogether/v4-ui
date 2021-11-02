import { Draw, PrizeDistributor, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'

/**
 * Returns the claimable draws and prize distributions
 * @param prizeDistributor
 * @returns
 */
export const useValidDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(prizeDistributor) && isDrawBeaconFetched
  return useQuery(
    [
      'useValidDrawsAndPrizeDistributions',
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => {
      const validDrawIds = await prizeDistributor.getValidDrawIds()
      let drawsAndPrizeDistributions = await prizeDistributor.getDrawsAndPrizeDistributions(
        validDrawIds
      )
      return drawsAndPrizeDistributions.sort(sortByDrawId)
    },
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const sortByDrawId = (
  a: {
    draw: Draw
    prizeDistribution: PrizeDistribution
  },
  b: {
    draw: Draw
    prizeDistribution: PrizeDistribution
  }
) => sortDrawsByDrawId(a.draw, b.draw)
