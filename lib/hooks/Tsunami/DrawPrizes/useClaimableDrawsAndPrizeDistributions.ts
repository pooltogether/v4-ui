import { Draw, DrawPrize, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

export const useClaimableDrawsAndPrizeDistributions = (drawPrize: DrawPrize) => {
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(drawPrize)
  return useQuery(
    ['useClaimableDrawsAndPrizeDistributions', drawPrize?.id(), nextDrawDate.toISOString()],
    async () => {
      let drawsAndPrizeDistributions = await drawPrize.getClaimableDrawsAndPrizeDistributions()
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
