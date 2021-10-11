import { Draw, PrizeDistributor, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

/**
 * Returns the claimable draws and prize distributions
 * @param prizeDistributor
 * @returns
 */
export const useValidDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(prizeDistributor)
  return useQuery(
    ['useValidDrawsAndPrizeDistributions', prizeDistributor?.id(), nextDrawDate.toISOString()],
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
