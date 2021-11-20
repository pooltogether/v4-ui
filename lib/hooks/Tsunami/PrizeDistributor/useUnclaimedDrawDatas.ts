import { Amount } from '@pooltogether/hooks'
import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { DrawData } from 'lib/types/v4'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { DrawLocks, useDrawLocks } from './useDrawLocks'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'
import { useValidDrawDatas } from './useValidDrawDatas'

/**
 * Fetches valid draw ids, fetches draws & claimed amounts, then filters out claimed draws.
 * - Valid draw ids
 *  - Draws
 *  - Claimed amounts
 * Filters draws
 * - with non zero claimed amounts
 * - with stored draw results that have a prize of 0
 * - with stored draw results that have been claimed
 * - where user had 0 average balance during the draw period
 * - that are locked
 * Refetches
 * - When the draw beacon period is updated
 * @param prizeDistributor the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUnclaimedDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const { data: drawLocks, isFetched: isDrawUnlockTimesFetched } = useDrawLocks()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data: drawDatas, isFetched: isDrawDatasFetched } = useValidDrawDatas(prizeDistributor)
  const { data: normalizedBalances, isFetched: isNormalizedBalancesFetched } =
    useUsersNormalizedBalances(prizeDistributor)
  const { data: claimedAmounts, isFetched: isClaimedAmountsFetched } =
    useUsersClaimedAmounts(prizeDistributor)

  const enabled =
    Boolean(prizeDistributor) &&
    isDrawUnlockTimesFetched &&
    isDrawBeaconFetched &&
    isDrawDatasFetched &&
    isNormalizedBalancesFetched &&
    isClaimedAmountsFetched

  return useQuery(
    [
      'useUnclaimedDrawDatas',
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString(),
      usersAddress,
      drawLocks
    ],
    async () => getUnclaimedDrawDatas(drawLocks, drawDatas, normalizedBalances, claimedAmounts),
    {
      enabled
    }
  )
}

const getUnclaimedDrawDatas = async (
  drawLocks: DrawLocks,
  drawDatas: { [drawId: number]: DrawData },
  normalizedBalances: { [drawId: number]: BigNumber },
  claimedAmounts: { [drawId: number]: Amount }
): Promise<{ [drawId: number]: DrawData }> => {
  const unclaimedDrawDatas: { [drawId: number]: DrawData } = {}
  const drawIds = Object.keys(drawDatas).map(Number)

  drawIds.forEach((drawId) => {
    const drawData = drawDatas[drawId]
    const claimedAmount = claimedAmounts[drawId]
    const normalizedBalance = normalizedBalances[drawId]
    const drawLock = drawLocks[drawId]

    // Filter draws with claimed amounts
    // Filter draws with no normalized balance during that period
    // Filter draws that are locked
    if (!claimedAmount.amountUnformatted.isZero() || normalizedBalance.isZero() || drawLock) {
      return
    }
    unclaimedDrawDatas[drawId] = drawData
  })

  return unclaimedDrawDatas
}
