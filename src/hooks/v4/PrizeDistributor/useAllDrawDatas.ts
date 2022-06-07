import { NO_REFETCH } from '@constants/query'
import { DrawData } from '@interfaces/v4'
import { Draw, PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { useAvailableDraws } from './useAvailableDraws'

/**
 * Fetches all draw data for all draws that are available in the DrawBuffer
 * @returns all draws and prize tiers if available in the buffers
 */
export const useAllDrawDatas = (prizeDistributor: PrizeDistributorV2) => {
  const { data, isFetched: isDrawsFetched } = useAvailableDraws(prizeDistributor)
  const enabled = isDrawsFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useAllDrawDatas', prizeDistributor?.id(), data?.draws ? Object.keys(data.draws) : []],
    () => getAllDrawDatas(prizeDistributor, data.draws),
    { ...NO_REFETCH, enabled }
  )
}

const getAllDrawDatas = async (
  prizeDistributor: PrizeDistributorV2,
  draws: { [drawId: number]: Draw }
) => {
  const drawIds = Object.keys(draws).map(Number)
  const prizeConfigs = await prizeDistributor.getPrizeConfigs(drawIds)

  const drawDatas: {
    [drawId: number]: DrawData
  } = {}

  drawIds.forEach((drawId) => {
    drawDatas[drawId] = { draw: draws[drawId], prizeConfig: prizeConfigs[drawId] }
  })

  return drawDatas
}
