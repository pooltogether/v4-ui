import { PrizeDistributor } from '@pooltogether/v4-js-client'

import { useDrawLocks } from './useDrawLocks'
import { useLockedDrawIds } from './useLockedDrawIds'
import { useValidDrawIds } from './useValidDrawIds'

export const useUnlockedDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const { isFetched: isDrawLocksFetched } = useDrawLocks()
  const lockedDrawIds = useLockedDrawIds()
  if (!isDrawIdsFetched || !isDrawLocksFetched) return { data: null, isFetched: false }

  const validDrawIds = data.drawIds
  if (lockedDrawIds.length === 0) return { data: validDrawIds, isFetched: true }
  return {
    data: validDrawIds.filter((drawId) => !lockedDrawIds.includes(drawId)),
    isFetched: true
  }
}
