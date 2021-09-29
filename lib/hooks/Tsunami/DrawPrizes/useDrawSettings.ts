import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

export const useDrawSettings = (drawPrize: DrawPrize, draw: Draw) => {
  const enabled = Boolean(drawPrize) && Boolean(draw)
  return useQuery(
    ['useDrawSettings', drawPrize?.id(), draw?.drawId],
    async () => drawPrize.getPrizeDistribution(draw.drawId),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
