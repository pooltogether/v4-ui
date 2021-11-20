import { useMemo } from 'react'
import { PrizeDistributor } from '@pooltogether/v4-js-client'

import { useDrawLocks } from './useDrawLocks'
import { useValidDrawIds } from './useValidDrawIds'

export const useUnlockedDrawIds = (prizeDistributor: PrizeDistributor) => {
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()
  const { data: drawIds, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  return useMemo(() => {
    if (!isDrawIdsFetched || !isDrawLocksFetched) return { data: null, isFetched: false }
    if (!drawLocks) return { data: drawIds, isFetched: true }
    const lockedDrawIds = Object.keys(drawLocks).map(Number)
    return { data: drawIds.filter((drawId) => !lockedDrawIds.includes(drawId)), isFetched: true }
  }, [isDrawIdsFetched, isDrawLocksFetched])
}
