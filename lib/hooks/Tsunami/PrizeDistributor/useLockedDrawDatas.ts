import { PrizeDistributor } from '@pooltogether/v4-js-client'

import { DrawData } from 'lib/types/v4'
import { useDrawLocks } from './useDrawLocks'
import { useLockedDrawIds } from './useLockedDrawIds'
import { useValidDrawDatas } from './useValidDrawDatas'

export const useLockedDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const drawIds = useLockedDrawIds()
  const { isFetched: isDrawLocksFetched } = useDrawLocks()
  const { data: drawDatas, isFetched: isDrawDatasFetched } = useValidDrawDatas(prizeDistributor)

  if (!isDrawDatasFetched || !isDrawLocksFetched) return null

  const lockedDrawDatas: {
    [drawId: number]: DrawData
  } = {}

  if (drawIds.length === 0) return lockedDrawDatas

  drawIds.forEach((drawId) => {
    lockedDrawDatas[drawId] = {
      draw: drawDatas[drawId].draw,
      prizeDistribution: drawDatas[drawId].prizeDistribution
    }
  })
  return lockedDrawDatas
}
