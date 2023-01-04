import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-client-js'
import { useAllDrawLocks } from './useAllDrawLocks'
import { useAllLockedDrawIds } from './useAllLockedDrawIds'
import { useAllPartialDrawDatas } from './useAllPartialDrawDatas'

export const useLockedPartialDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const drawIds = useAllLockedDrawIds()
  const queryResults = useAllDrawLocks()
  const isDrawLocksFetched = queryResults.every(({ isFetched }) => isFetched)
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
    const drawData = drawDatas[drawId]
    if (drawData) {
      lockedDrawDatas[drawId] = {
        draw: drawData.draw,
        prizeDistribution: drawData.prizeDistribution
      }
    }
  })
  return lockedDrawDatas
}
