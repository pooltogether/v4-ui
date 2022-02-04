import { Amount } from '@pooltogether/hooks'
import { DrawResults, PrizeDistributor } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { DrawData } from 'lib/types/v4'
import { useDrawLocks } from './useDrawLocks'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'
import { useValidDrawDatas } from './useValidDrawDatas'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'
import { NO_REFETCH } from 'lib/constants/query'
import { useLockedDrawIds } from './useLockedDrawIds'
import { msToS } from '@pooltogether/utilities'

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
 * - that are expired
 * Reruns
 * - When the draw beacon period is updated
 * - When draw locks are updated
 * - When draw locks finish
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
  const lockedDrawIds = useLockedDrawIds()
  const { isFetched: isDrawUnlockTimesFetched } = useDrawLocks()
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
  const claimedAmounts = claimedAmountsData?.claimedAmounts
  const claimedAmountsUsersAddress = claimedAmountsData?.usersAddress

  // Check if there is data keyed by the same users address so we aren't mixing data
  const userAddressesMatch =
    Boolean(drawResults) &&
    Boolean(normalizedBalances) &&
    claimedAmountsUsersAddress === usersAddress

  const enabled =
    Boolean(prizeDistributor) &&
    isDrawUnlockTimesFetched &&
    isDrawDatasFetched &&
    isNormalizedBalancesFetched &&
    isClaimedAmountsFetched &&
    userAddressesMatch

  const lockedDrawsKey = lockedDrawIds ? 'lockedDraws-' + lockedDrawIds.join(',') : ''
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
      lockedDrawsKey,
      claimedAmountsKey,
      normalizedBalancesKey,
      drawDatasKey
    ],
    async () =>
      getUnclaimedDrawDatas(
        usersAddress,
        lockedDrawIds,
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
  lockedDrawIds: number[],
  drawDatas: { [drawId: number]: DrawData },
  normalizedBalances: { [drawId: number]: BigNumber },
  claimedAmounts: { [drawId: number]: Amount },
  drawResults: {
    [drawId: number]: DrawResults
  }
): Promise<{ [usersAddress: string]: { [drawId: number]: DrawData } }> => {
  const unclaimedDrawDatas: { [drawId: number]: DrawData } = {}
  const drawIds = Object.keys(drawDatas).map(Number)

  const currentTimestampSeconds = msToS(Date.now())

  drawIds.forEach((drawId) => {
    const drawData = drawDatas[drawId]
    const claimedAmount = claimedAmounts[drawId]
    const normalizedBalance = normalizedBalances[drawId]
    const isLocked = lockedDrawIds.includes(drawId)
    const drawResult = drawResults?.[drawId]

    const { draw, prizeDistribution } = drawData
    const drawTimestampSeconds = draw.timestamp.toNumber()
    const drawExpirationTimestampSeconds = prizeDistribution.expiryDuration + drawTimestampSeconds

    // Filter draws with claimed amounts
    // Filter draws with no normalized balance during that period
    // Filter draws that are locked
    // Filter draws that are expired
    if (
      !claimedAmount.amountUnformatted.isZero() ||
      normalizedBalance.isZero() ||
      isLocked ||
      (Boolean(drawResult) && drawResult.totalValue.isZero()) ||
      drawExpirationTimestampSeconds <= currentTimestampSeconds
    ) {
      return
    }
    unclaimedDrawDatas[drawId] = drawData
  })
  return {
    [usersAddress]: unclaimedDrawDatas
  }
}
