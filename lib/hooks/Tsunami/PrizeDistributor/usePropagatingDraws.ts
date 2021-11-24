import { Draw, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useAllDrawDatas } from './useAllDrawDatas'

export const usePropagatingDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawDatas, isFetched } = useAllDrawDatas(prizeDistributor)

  if (!isFetched) {
    return {
      data: null,
      isFetched: false
    }
  }

  const propagatingDraws: { [chainId: number]: { draw: Draw } } = {}
  const drawIds = Object.keys(drawDatas).map(Number)
  drawIds.forEach((drawId) => {
    const drawData = drawDatas[drawId]
    if (!drawData.prizeDistribution) {
      propagatingDraws[drawId] = { draw: drawData.draw }
    }
  })

  return {
    data: propagatingDraws,
    isFetched: true
  }
}
