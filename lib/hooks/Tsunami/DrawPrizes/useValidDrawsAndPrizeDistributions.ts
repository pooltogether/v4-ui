import { DrawPrize } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

export const useValidDrawsAndPrizeDistributions = (drawPrize: DrawPrize) => {
  const enabled = Boolean(drawPrize)
  const nextDrawDate = useNextDrawDate()
  return useQuery(
    ['useValidDrawsAndPrizeDistributions', drawPrize?.id(), nextDrawDate.toISOString()],
    async () => drawPrize.getValidDrawsAndPrizeDistributions(),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
