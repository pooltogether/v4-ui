import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-js-client'

import { useAllPartialDrawDatas } from './useAllPartialDrawDatas'
import { useDrawLocks } from './useDrawLocks'
import { useLockedDrawIds } from './useLockedDrawIds'

export const useLockedPartialDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const drawIds = useLockedDrawIds()
  const { isFetched: isDrawLocksFetched } = useDrawLocks()
  const { data: drawDatas, isFetched: isDrawDatasFetched } =
    useAllPartialDrawDatas(prizeDistributor)

  if (!isDrawDatasFetched || !isDrawLocksFetched) return null

  const lockedDrawDatas: {
    [drawId: number]: {
      draw: Draw
      prizeDistribution?: PrizeDistribution
    }
  } = {}

  if (drawIds.length === 0) return lockedDrawDatas

  drawIds.forEach((drawId) => {
    lockedDrawDatas[drawId] = {
      draw: drawDatas[drawId].draw,
      prizeDistribution: drawDatas[drawId]?.prizeDistribution
    }
  })
  return lockedDrawDatas
}
