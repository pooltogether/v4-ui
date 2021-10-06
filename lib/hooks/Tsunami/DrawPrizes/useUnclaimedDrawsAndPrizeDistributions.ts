import { DrawPrize, Draw, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult, StoredDrawStates } from 'lib/utils/drawResultsStorage'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

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
 * @param drawPrize the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUnclaimedDrawsAndPrizeDistributions = (drawPrize: DrawPrize) => {
  const usersAddress = useUsersAddress()
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(drawPrize)
  return useQuery(
    [
      'useUnclaimedDrawsAndPrizeDistributions',
      drawPrize?.id(),
      nextDrawDate.toISOString(),
      usersAddress
    ],
    async () => getUnclaimedDrawsAndPrizeDistributions(usersAddress, drawPrize),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDrawsAndPrizeDistributions = async (
  usersAddress: string,
  drawPrize: DrawPrize
): Promise<{ draw: Draw; prizeDistribution: PrizeDistribution }[]> => {
  const drawIds = await drawPrize.getClaimableDrawIds()
  const [drawsAndPrizeDistributions, claimedAmounts] = await Promise.all([
    drawPrize.getDrawsAndPrizeDistributions(drawIds),
    drawPrize.getUsersClaimedAmounts(usersAddress, drawIds)
  ])
  // Filter draws with claimed amounts
  // TODO: Ensure claimed amounts are max claimable amount, probably do this in v4-js-sdk
  let unclaimedDrawsAndPrizeDistributions = drawsAndPrizeDistributions.filter((_, index) =>
    claimedAmounts[index].isZero()
  )

  // Filter checked draws with no prize to claim
  // Filter checked draws that are claimed
  if (usersAddress) {
    unclaimedDrawsAndPrizeDistributions = unclaimedDrawsAndPrizeDistributions.filter(
      (drawAndPrizeDistribution) => {
        const storedResult = getStoredDrawResult(
          usersAddress,
          drawPrize,
          drawAndPrizeDistribution.draw.drawId
        )
        if (storedResult?.drawResults.totalValue.isZero()) return false
        if (storedResult?.state === StoredDrawStates.claimed) return false
        return true
      }
    )
  }

  return unclaimedDrawsAndPrizeDistributions.sort((a, b) => sortDrawsByDrawId(a.draw, b.draw))
}
