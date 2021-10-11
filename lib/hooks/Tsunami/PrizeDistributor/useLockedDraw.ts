import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

/**
 *
 * @param prizeDistributor
 * @returns
 */
export const useLockedDraw = (prizeDistributor: PrizeDistributor) => {
  const enabled = Boolean(prizeDistributor)
  return useQuery(
    ['useLockedDraw', prizeDistributor?.id()],
    () => prizeDistributor.getLockedDraw(),
    { enabled }
  )
}
