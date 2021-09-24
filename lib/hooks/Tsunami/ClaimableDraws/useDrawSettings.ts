import { ClaimableDraw, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

export const useDrawSettings = (claimableDraw: ClaimableDraw, draw: Draw) => {
  const enabled = Boolean(claimableDraw) && Boolean(draw)
  return useQuery(
    ['useDrawSettings', claimableDraw?.id(), draw?.drawId],
    async () => claimableDraw.getDrawSetting(draw.drawId),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
