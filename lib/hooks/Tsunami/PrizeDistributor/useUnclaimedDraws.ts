import { PrizeDistributor, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult, StoredDrawStates } from 'lib/utils/drawResultsStorage'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

// TODO: Check that next draw date to refetch works

/**
 * Fetches claimable draw ids, fetches draws & claimed amounts, then filters out claimed draws.
 * - Fetches claimable draw ids
 *  - then draws and claimed amounts
 * Filters draws with
 * - non zero claimed amounts
 * - stored draw results that have a prize of 0
 * - stored draw results that have been claimed
 * @param prizeDistributor the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUnclaimedDraws = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress)
  return useQuery(
    ['useUnclaimedDraws', prizeDistributor?.id(), nextDrawDate.toISOString()],
    async () => getUnclaimedDraws(usersAddress, prizeDistributor),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDraws = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
): Promise<Draw[]> => {
  const drawIds = await prizeDistributor.getClaimableDrawIds()
  const [draws, claimedAmounts] = await Promise.all([
    prizeDistributor.getDraws(drawIds),
    prizeDistributor.getUsersClaimedAmounts(usersAddress, drawIds)
  ])
  // Filter draws with claimed amounts
  // TODO: Ensure claimed amounts are max claimable amount, probably do this in v4-js-sdk
  let unclaimedDraws = draws.filter((_, index) => claimedAmounts[index].isZero())

  // Filter checked draws with no prize to claim
  // Filter checked draws that are claimed
  unclaimedDraws = unclaimedDraws.filter((draw) => {
    const storedResult = getStoredDrawResult(usersAddress, prizeDistributor, draw.drawId)
    if (storedResult?.drawResults.totalValue.isZero()) return false
    if (storedResult?.state === StoredDrawStates.claimed) return false
    return true
  })

  return unclaimedDraws
}
