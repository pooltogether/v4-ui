import { Draw, PrizeDistribution, PrizeDistributor } from '.yalc/@pooltogether/v4-js-client/dist'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useAllDraws } from './useAllDraws'

interface DrawAndPrizeDistribution {
  draw: Draw
  prizeDistribution?: PrizeDistribution
}

/**
 * TODO: Add locks
 * @returns all draws and prize distributions if available
 */
export const useAllDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const { data: draws, isFetched: isDrawsFetched } = useAllDraws()
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
  const drawsAndPrizeDistributions: DrawAndPrizeDistribution[] = []

  // Pair up all of the draws and prize distributions
  prizeDistributionBufferDrawIds.forEach((drawId, index) => {
    const prizeDistribution = prizeDistributions[index]
    const draw = draws.find((draw) => drawId === draw.drawId)
    drawsAndPrizeDistributions.push({ draw, prizeDistribution })
  })

  // Push any beacon draw ids that are missing into the array
  const missingDraws = draws.filter((draw) => !prizeDistributionBufferDrawIds.includes(draw.drawId))

  missingDraws.forEach((draw) => {
    drawsAndPrizeDistributions.push({ draw })
  })

  return drawsAndPrizeDistributions.sort(sortByDrawId)
}

const sortByDrawId = (a: DrawAndPrizeDistribution, b: DrawAndPrizeDistribution) =>
  sortDrawsByDrawId(a.draw, b.draw)

/**
 * Can I have a draw on mainnet but not on L2?
 * YES
 * If the defender hasn't run yet. This is when the draw beacon is in the "ending soon" state.
 * Need to fetch MAINNET draw ids. Then fetch
 */
