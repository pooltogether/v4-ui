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
export const useClaimableDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(prizeDistributor)
  return useQuery(
    ['useClaimableDrawsAndPrizeDistributions', prizeDistributor?.id(), nextDrawDate.toISOString()],
    async () => {
      let drawsAndPrizeDistributions =
        await prizeDistributor.getClaimableDrawsAndPrizeDistributions()
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
