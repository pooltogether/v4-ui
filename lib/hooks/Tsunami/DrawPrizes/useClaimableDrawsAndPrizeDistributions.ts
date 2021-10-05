import { DrawPrize } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

export const useClaimableDrawsAndPrizeDistributions = (drawPrize: DrawPrize) => {
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(drawPrize)
  return useQuery(
    ['useClaimableDrawsAndPrizeDistributions', drawPrize?.id(), nextDrawDate.toISOString()],
    async () => drawPrize.getClaimableDrawsAndPrizeDistributions(),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
