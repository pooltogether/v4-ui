import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { DrawData } from 'lib/types/v4'
import { useDrawLocks } from './useDrawLocks'
import { useValidDrawDatas } from './useValidDrawDatas'

export const useLockedDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()
  const { data: drawDatas, isFetched: isDrawDatasFetched } = useValidDrawDatas(prizeDistributor)

  if (!isDrawDatasFetched || !isDrawLocksFetched) return null

  const lockedDrawDatas: {
    [drawId: number]: DrawData
  } = {}

  if (!drawLocks) return lockedDrawDatas

  const drawIds = Object.keys(drawLocks)
  drawIds.forEach((drawId) => {
    lockedDrawDatas[drawId] = {
      draw: drawDatas[drawId].draw,
      prizeDistribution: drawDatas[drawId].prizeDistribution
    }
  })
  return lockedDrawDatas
}
