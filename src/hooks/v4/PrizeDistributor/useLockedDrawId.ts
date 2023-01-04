import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useDrawLocks } from './useDrawLocks'

export const useLockedDrawId = (prizeDistributor: PrizeDistributor) => {
  const { data } = useDrawLocks(prizeDistributor)
  return data?.drawId
}
