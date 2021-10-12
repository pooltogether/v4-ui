import { PrizeDistributor, Draw, PrizeDistribution } from '@pooltogether/v4-js-client'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult, StoredDrawStates } from 'lib/utils/drawResultsStorage'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { DrawLock, DrawLocks, useDrawLocks } from './useDrawLocks'

// TODO: Check that next draw date to refetch works

/**
 * Fetches valid draw ids, fetches draws & claimed amounts, then filters out claimed draws.
 * - Valid draw ids
 *  - Draws
 *  - Claimed amounts
 * Filters draws with
 * - non zero claimed amounts
 * - stored draw results that have a prize of 0
 * - stored draw results that have been claimed
 * - user had 0 average balance during the draw period
 * Appends draws with timelock data if available
 * Refetches
 * - When the draw beacon period is updated
 * @param prizeDistributor the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUnclaimedDrawsAndPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const { data: drawLocks, isFetched: isDrawUnlockTimesFetched } = useDrawLocks()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(prizeDistributor) && isDrawUnlockTimesFetched && isDrawBeaconFetched

  return useQuery(
    [
      'useUnclaimedDrawsAndPrizeDistributions',
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString(),
      usersAddress,
      drawLocks
    ],
    async () => getUnclaimedDrawsAndPrizeDistributions(usersAddress, prizeDistributor, drawLocks),
    {
      enabled
    }
  )
}

// TODO: Add back normalized balance checks
const getUnclaimedDrawsAndPrizeDistributions = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawLocks: DrawLocks
): Promise<
  {
    draw: Draw
    prizeDistribution: PrizeDistribution
    drawLock?: DrawLock
  }[]
> => {
  const drawIds = await prizeDistributor.getValidDrawIds()
  const [drawsAndPrizeDistributions, claimedAmounts, normalizedBalances] = await Promise.all([
    prizeDistributor.getDrawsAndPrizeDistributions(drawIds),
    prizeDistributor.getUsersClaimedAmounts(usersAddress, drawIds),
    prizeDistributor.getUsersNormalizedBalancesForDrawIds(usersAddress, drawIds)
  ])

  // TODO: Ensure claimed amounts are max claimable amount, probably do this in v4-js-sdk?
  const unclaimedDrawsAndPrizeDistributions = drawsAndPrizeDistributions
    .filter((drawAndPrizeDistribution, index) => {
      // Filter draws with claimed amounts
      if (!claimedAmounts[index].isZero()) return false
      // Filter draws with no normalized balance during that period
      if (normalizedBalances[index].isZero()) return false

      const storedResult = getStoredDrawResult(
        usersAddress,
        prizeDistributor,
        drawAndPrizeDistribution.draw.drawId
      )
      // Filter checked draws with no prize to claim
      if (storedResult?.drawResults.totalValue.isZero()) return false
      // Filter checked draws that are claimed
      if (storedResult?.state === StoredDrawStates.claimed) return false
      return true
    })
    .map((drawAndPrizeDistribution) => {
      const drawLock = drawLocks[drawAndPrizeDistribution.draw.drawId]

      return {
        ...drawAndPrizeDistribution,
        drawLock
      }
    })
    .sort((a, b) => sortDrawsByDrawId(a.draw, b.draw))

  return unclaimedDrawsAndPrizeDistributions
}
