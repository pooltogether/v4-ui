import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

export const usePrizeDistribution = (drawPrize: DrawPrize, draw: Draw) => {
  const enabled = Boolean(drawPrize) && Boolean(draw)
  return useQuery(
    ['usePrizeDistribution', drawPrize?.id(), draw?.drawId],
    async () => drawPrize.getPrizeDistribution(draw.drawId),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
