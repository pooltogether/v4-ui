import { PrizeDistributor, Draw } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeDistribution = (prizeDistributor: PrizeDistributor, draw: Draw) => {
  const enabled = Boolean(prizeDistributor) && Boolean(draw)
  return useQuery(
    ['usePrizeDistribution', prizeDistributor?.id(), draw?.drawId],
    async () => prizeDistributor.getPrizeDistribution(draw.drawId),
    {
      enabled
    }
  )
}
