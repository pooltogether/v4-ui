import { Amount } from '@pooltogether/hooks'
import { DrawResults, PrizeDistributor } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { msToS } from '@pooltogether/utilities'

import { DrawData } from 'lib/types/v4'
import { DrawLocks, useDrawLocks } from './useDrawLocks'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'
import { useValidDrawDatas } from './useValidDrawDatas'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'
import { NO_REFETCH } from 'lib/constants/query'

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
 * - When draw locks are updated
 * - When claimed amounts are updated
 * - When user normalized balances are updated
 * - When valid draw datas are updated
 * @param prizeDistributor the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUsersUnclaimedDrawDatas = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  // Generic data
  const { data: drawLocks, isFetched: isDrawUnlockTimesFetched } = useDrawLocks()
  const { data: drawDatas, isFetched: isDrawDatasFetched } = useValidDrawDatas(prizeDistributor)
  // User specific data
  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor)
  const { data: normalizedBalancesData, isFetched: isNormalizedBalancesFetched } =
    useUsersNormalizedBalances(usersAddress, prizeDistributor)
  const { data: claimedAmountsData, isFetched: isClaimedAmountsFetched } = useUsersClaimedAmounts(
    usersAddress,
    prizeDistributor
  )

  const drawResults = storedDrawResults?.[usersAddress]
  const normalizedBalances = normalizedBalancesData?.[usersAddress]
  const claimedAmounts = claimedAmountsData?.[usersAddress]

  // Check if there is data keyed by the same users address so we aren't mixing data
  const userAddressesMatch =
    Boolean(drawResults) && Boolean(normalizedBalances) && Boolean(claimedAmounts)

  const enabled =
    Boolean(prizeDistributor) &&
    isDrawUnlockTimesFetched &&
    isDrawDatasFetched &&
    isNormalizedBalancesFetched &&
    isClaimedAmountsFetched &&
    userAddressesMatch

  const drawLocksKey = drawLocks ? 'drawLocks-' + Object.keys(drawLocks).join(',') : ''
  const claimedAmountsKey = claimedAmounts
    ? 'claimedAmounts-' +
      Object.values(claimedAmounts)
        .map((value) => value.amount)
        .join(',')
    : ''
  const normalizedBalancesKey = normalizedBalances
    ? 'normalizedBalances-' +
      Object.values(normalizedBalances)
        .map((value) => value.toString())
        .join(',')
    : ''
  const drawDatasKey = drawDatas ? 'drawDatas-' + Object.keys(drawDatas).join(',') : ''

  return useQuery(
    [
      'useUsersUnclaimedDrawDatas',
      prizeDistributor?.id(),
      usersAddress,
      drawLocksKey,
      claimedAmountsKey,
      normalizedBalancesKey,
      drawDatasKey
    ],
    async () =>
      getUnclaimedDrawDatas(
        usersAddress,
        drawLocks,
        drawDatas,
        normalizedBalances,
        claimedAmounts,
        drawResults
      ),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDrawDatas = async (
  usersAddress: string,
  drawLocks: DrawLocks,
  drawDatas: { [drawId: number]: DrawData },
  normalizedBalances: { [drawId: number]: BigNumber },
  claimedAmounts: { [drawId: number]: Amount },
  drawResults: {
    [drawId: number]: DrawResults
  }
): Promise<{ [usersAddress: string]: { [drawId: number]: DrawData } }> => {
  const unclaimedDrawDatas: { [drawId: number]: DrawData } = {}
  const drawIds = Object.keys(drawDatas).map(Number)

  drawIds.forEach((drawId) => {
    const drawData = drawDatas[drawId]
    const claimedAmount = claimedAmounts[drawId]
    const normalizedBalance = normalizedBalances[drawId]
    const drawLock = drawLocks[drawId]
    const drawResult = drawResults?.[drawId]

    // Filter draws with claimed amounts
    // Filter draws with no normalized balance during that period
    // Filter draws that are locked
    if (
      !claimedAmount.amountUnformatted.isZero() ||
      normalizedBalance.isZero() ||
      (Boolean(drawLock) &&
        drawLock.endTimeSeconds.gte(BigNumber.from(Math.floor(msToS(Date.now()))))) ||
      (Boolean(drawResult) && drawResult.totalValue.isZero())
    ) {
      return
    }
    unclaimedDrawDatas[drawId] = drawData
  })
  return {
    [usersAddress]: unclaimedDrawDatas
  }
}
