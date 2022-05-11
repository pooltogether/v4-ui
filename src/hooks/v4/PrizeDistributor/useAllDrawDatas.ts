import { NO_REFETCH } from '@constants/query'
import { DrawData } from '@interfaces/v4'
import { Draw, PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { useAvailableDraws } from './useAvailableDraws'

/**
 * Fetches all draw data for all draws that are available in the DrawBuffer
 * @returns all draws and prize tiers if available in the buffers
 */
export const useAllDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const { data, isFetched: isDrawsFetched } = useAvailableDraws(prizeDistributor)
  const enabled = isDrawsFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useAllDrawDatas', prizeDistributor?.id(), data?.draws ? Object.keys(data.draws) : []],
    () => getAllDrawDatas(prizeDistributor, data.draws),
    { ...NO_REFETCH, enabled }
  )
}

const getAllDrawDatas = async (
  prizeDistributor: PrizeDistributor,
  draws: { [drawId: number]: Draw }
) => {
  const drawIds = Object.keys(draws).map(Number)
  const prizeTiers = await prizeDistributor.getPrizeTiers(drawIds)

  const drawDatas: {
    [drawId: number]: DrawData
  } = {}

  drawIds.forEach((drawId) => {
    drawDatas[drawId] = { draw: draws[drawId], prizeTier: prizeTiers[drawId] }
  })

  return drawDatas
}
