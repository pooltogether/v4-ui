import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'
import { useAllBeaconChainDraws } from './useAllBeaconChainDraws'

/**
 * @returns all draws and prize distributions if available in the buffers
 */
export const useAllPartialDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const { data: draws, isFetched: isDrawsFetched } = useAllBeaconChainDraws()
  const enabled = isDrawsFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useAllPartialDrawDatas', prizeDistributor?.id(), draws ? Object.keys(draws) : []],
    () => getAllDrawDatas(prizeDistributor, draws),
    { enabled }
  )
}

const getAllDrawDatas = async (
  prizeDistributor: PrizeDistributor,
  draws: { [drawId: number]: Draw }
) => {
  const prizeDistributionBufferDrawIds =
    await prizeDistributor.getDrawIdsFromPrizeDistributionBuffer()
  const prizeDistributions = await prizeDistributor.getPrizeDistributions(
    prizeDistributionBufferDrawIds
  )

  // NOTE: PrizeDistributionBuffer draw ids can never be greater than DrawBuffer
  const drawDatas: {
    [drawId: number]: {
      draw: Draw
      prizeDistribution?: PrizeDistribution
    }
  } = {}

  // Pair up all of the draws and prize distributions
  prizeDistributionBufferDrawIds.forEach((drawId) => {
    const prizeDistribution = prizeDistributions[drawId]
    const draw = draws[drawId]
    drawDatas[draw.drawId] = { draw, prizeDistribution }
  })

  // Push any beacon draw ids that are newer than the oldest prize distribution that are missing into the array
  Object.keys(draws)
    .map(Number)
    .forEach((drawId) => {
      if (
        !prizeDistributionBufferDrawIds.includes(drawId) &&
        (prizeDistributionBufferDrawIds.length === 0 || drawId > prizeDistributionBufferDrawIds[0])
      ) {
        const draw = draws[drawId]
        drawDatas[drawId] = { draw }
      }
    })

  return drawDatas
}
