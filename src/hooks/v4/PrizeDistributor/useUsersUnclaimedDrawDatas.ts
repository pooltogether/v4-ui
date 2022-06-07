import { Amount } from '@pooltogether/hooks'
import { DrawResults, PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { DrawData } from '../../../interfaces/v4'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersPickCounts } from './useUsersPickCounts'
import { useAllDrawDatas } from './useAllDrawDatas'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'
import { NO_REFETCH } from '@constants/query'
import { msToS } from '@pooltogether/utilities'
import { useSelectedPrizePoolTicket } from '../PrizePool/useSelectedPrizePoolTicket'
import { useValidDrawDatas } from './useValidDrawDatas'

/**
 * Fetches available draw ids, fetches draws & claimed amounts, then filters out claimed draws.
 * - Valid draw ids
 *  - Draws
 *  - Claimed amounts
 * Filters draws
 * - with non zero claimed amounts
 * - with stored draw results that have a prize of 0
 * - with stored draw results that have been claimed
 * - where user had 0 average balance during the draw period
 * - that are expired
 * Reruns
 * - When the draw beacon period is updated
 * - When claimed amounts are updated
 * - When user normalized balances are updated
 * - When available draw datas are updated
 * @param prizeDistributor the Draw Prize to fetch unclaimed draws for
 * @returns
 */
export const useUsersUnclaimedDrawDatas = (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2
) => {
  // Generic data
  const drawDatas = useValidDrawDatas(prizeDistributor)
  const { data: ticket } = useSelectedPrizePoolTicket()
  // User specific data
  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor, ticket)
  const { data: pickCountsData, isFetched: isPickCountsFetched } = useUsersPickCounts(
    usersAddress,
    ticket?.address,
    prizeDistributor
  )
  const { data: claimedAmountsData, isFetched: isClaimedAmountsFetched } = useUsersClaimedAmounts(
    usersAddress,
    prizeDistributor
  )

  const drawResults = storedDrawResults?.[usersAddress]
  const pickCounts = pickCountsData?.pickCounts
  const pickCountsUsersAddress = pickCountsData?.usersAddress
  const claimedAmounts = claimedAmountsData?.claimedAmounts
  const claimedAmountsUsersAddress = claimedAmountsData?.usersAddress

  // Check if there is data keyed by the same users address so we aren't mixing data
  const userAddressesMatch =
    Boolean(drawResults) &&
    Boolean(pickCounts) &&
    claimedAmountsUsersAddress === usersAddress &&
    pickCountsUsersAddress === usersAddress

  const enabled =
    Boolean(prizeDistributor) &&
    !!drawDatas &&
    isPickCountsFetched &&
    isClaimedAmountsFetched &&
    userAddressesMatch

  const claimedAmountsKey = claimedAmounts
    ? 'claimedAmounts-' +
      Object.values(claimedAmounts)
        .map((value) => value.amount)
        .join(',')
    : ''
  const pickCountsKey = pickCounts
    ? 'pickCounts-' +
      Object.values(pickCounts)
        .map((value) => value.toString())
        .join(',')
    : ''
  const drawDatasKey = drawDatas ? 'drawDatas-' + Object.keys(drawDatas).join(',') : ''

  return useQuery(
    [
      'useUsersUnclaimedDrawDatas',
      prizeDistributor?.id(),
      ticket?.address,
      usersAddress,
      claimedAmountsKey,
      pickCountsKey,
      drawDatasKey
    ],
    async () =>
      getUnclaimedDrawDatas(usersAddress, drawDatas, pickCounts, claimedAmounts, drawResults),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDrawDatas = async (
  usersAddress: string,
  drawDatas: { [drawId: number]: DrawData },
  pickCounts: { [drawId: number]: BigNumber },
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
    const pickCount = pickCounts[drawId]
    const drawResult = drawResults?.[drawId]

    const { draw, prizeConfig } = drawData
    const drawTimestampSeconds = draw.timestamp.toNumber()
    const drawExpirationTimestampSeconds = prizeConfig.expiryDuration + drawTimestampSeconds

    // Filter draws with claimed amounts
    // Filter draws with no normalized balance during that period
    // Filter draws that are expired
    if (
      !claimedAmount.amountUnformatted.isZero() ||
      pickCount.isZero() ||
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
