import { Draw, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'
import { useAllBeaconChainDraws } from './useAllBeaconChainDraws'
import { DrawData } from 'lib/types/v4'

/**
 * TODO: Add locks
 * @returns all draws and prize distributions if available
 */
export const useAllDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const { data: draws, isFetched: isDrawsFetched } = useAllBeaconChainDraws()
  const enabled = isDrawsFetched && Boolean(prizeDistributor)
  return useQuery(
    ['useAllDrawsAndPrizeDistributions', prizeDistributor?.id(), draws?.map((d) => d.drawId)],
    () => getAllDrawsAndPrizeDistributions(prizeDistributor, draws),
    { enabled }
  )
}

const getAllDrawsAndPrizeDistributions = async (
  prizeDistributor: PrizeDistributor,
  draws: Draw[]
) => {
  const prizeDistributionBufferDrawIds =
    await prizeDistributor.getDrawIdsFromPrizeDistributionBuffer()
  const prizeDistributions = await prizeDistributor.getPrizeDistributions(
    prizeDistributionBufferDrawIds
  )

  // NOTE: PrizeDistributionBuffer draw ids can never be greater than DrawBuffer
  const drawsAndPrizeDistributions: { [drawId: number]: Partial<DrawData> } = {}

  // Pair up all of the draws and prize distributions
  prizeDistributionBufferDrawIds.forEach((drawId, index) => {
    const prizeDistribution = prizeDistributions[index]
    const draw = draws.find((draw) => drawId === draw.drawId)
    drawsAndPrizeDistributions[draw.drawId] = { draw, prizeDistribution }
  })

  // Push any beacon draw ids that are newer than the oldesr prize distribution that are missing into the array
  const missingDraws = draws.filter(
    (draw) =>
      !prizeDistributionBufferDrawIds.includes(draw.drawId) &&
      (prizeDistributionBufferDrawIds.length === 0 ||
        draw.drawId > prizeDistributionBufferDrawIds[0])
  )

  missingDraws.forEach((draw) => {
    drawsAndPrizeDistributions[draw.drawId] = { draw }
  })

  return drawsAndPrizeDistributions
}
