import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllLockedDrawIds } from './useAllLockedDrawIds'
import { useValidDrawIds } from './useValidDrawIds'

export const useLatestUnlockedDrawId = (prizeDistributor: PrizeDistributor) => {
  const { data, isFetched } = useValidDrawIds(prizeDistributor)
  const lockedDrawIds = useAllLockedDrawIds()
  return useMemo(() => {
    if (!isFetched) return { drawId: undefined, prizeDistributor }

    const { drawIds } = data

    return {
      prizeDistributor,
      drawId: getLatestUnlockedDrawId(drawIds, lockedDrawIds)
    }
  }, [isFetched, data, prizeDistributor, lockedDrawIds])
}

/**
 *
 * @param drawIds
 * @param lockedDrawIds
 */
export const getLatestUnlockedDrawId = (drawIds: number[], lockedDrawIds: number[]) => {
  let drawId
  for (let i = drawIds.length - 1; i >= 0; i--) {
    const potentialId = drawIds[i]
    if (!lockedDrawIds.includes(potentialId)) {
      drawId = potentialId
      break
    }
  }
  return drawId
}
