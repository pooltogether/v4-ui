import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult } from 'lib/utils/drawResultsStorage'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

// TODO: Check that next draw date to refetch works

/**
 * Fetches valid draw ids, fetches draws & claimed amounts, then filters out claimed draws.
 * - Valid draw ids
 *  - Draws
 *  - Claimed amounts
 * Filters draws
 * - with non zero claimed amounts
 * - with stored draw results that have a prize of 0
 * @param drawPrize the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUnclaimedDraws = (drawPrize: DrawPrize) => {
  const usersAddress = useUsersAddress()
  const nextDrawDate = useNextDrawDate()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress)
  return useQuery(
    ['useUnclaimedDraws', drawPrize?.id(), nextDrawDate.toISOString()],
    async () => getUnclaimedDraws(usersAddress, drawPrize),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDraws = async (usersAddress: string, drawPrize: DrawPrize): Promise<Draw[]> => {
  const drawIds = await drawPrize.getValidDrawIds()
  const [draws, claimedAmounts] = await Promise.all([
    drawPrize.getDraws(drawIds),
    drawPrize.getUsersClaimedAmounts(usersAddress, drawIds)
  ])
  // Filter draws with claimed amounts
  // TODO: Ensure claimed amounts are max claimable amount
  let unclaimedDraws = draws.filter((_, index) => claimedAmounts[index].isZero())

  // Filter checked draws with no prize to claim
  unclaimedDraws = unclaimedDraws.filter((draw) => {
    const storedResult = getStoredDrawResult(usersAddress, drawPrize, draw.drawId)
    if (storedResult?.drawResults.totalValue.isZero()) return false
    return true
  })

  return unclaimedDraws
}
