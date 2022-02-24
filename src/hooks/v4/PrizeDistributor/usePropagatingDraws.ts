import { Draw, PrizeDistributor } from '@pooltogether/v4-client-js'
import { useAllPartialDrawDatas } from './useAllPartialDrawDatas'

export const usePropagatingDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawDatas, isFetched } = useAllPartialDrawDatas(prizeDistributor)

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
