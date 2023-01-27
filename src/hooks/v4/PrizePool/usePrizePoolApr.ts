import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * Assumes all Prize Pools are using DPR.
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const {
    data: prizeTierData,
    isFetched: isPrizeTierFetched,
    isError
  } = useUpcomingPrizeTier(prizePool)

  const enabled = isPrizeTierFetched && !!prizeTierData.prizeTier && !isError

  return useQuery(
    ['usePrizePoolApr', prizeTierData?.prizeTier],
    () => {
      if ('dpr' in prizeTierData.prizeTier) {
        return (prizeTierData.prizeTier.dpr * 365) / 1e7
      } else {
        throw new Error('Legacy Prize Pool not supported.')
      }
    },
    {
      enabled
    }
  )
}
