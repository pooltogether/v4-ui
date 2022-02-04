import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useMemo } from 'react'

import { getStoredDrawResults } from 'lib/utils/drawResultsStorage'
import { useUnclaimedDrawIds } from './useUnclaimedDrawIds'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'

/**
 *
 * @param prizeDistributor
 * @returns
 */
export const useHasUserCheckedAllDraws = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  const { data: drawIds, isFetched: isDrawIdsFetched } = useUnclaimedDrawIds(
    usersAddress,
    prizeDistributor
  )
  const { data: claimedAmountsData, isFetched: isClaimedAmountsFetched } = useUsersClaimedAmounts(
    usersAddress,
    prizeDistributor
  )
  const { data: normalizedBalancesData, isFetched: isNormalizedBalancesFetched } =
    useUsersNormalizedBalances(usersAddress, prizeDistributor)

  /**
   * This is kind of cheeky. We're reading straight from local storage to get the "checked" draw results (Draw results for draws that the user has clicked "Check for prizes" on). If the user hasn't checked the draw before we fetch them when the user clicks "Check for prizes" and then store them in the local storage. This update to local storage WILL NOT trigger this useMemo to rerun. We want that. Otherwise there may be some other state jumps where the UI expects the user to not have checked all before, but becaues it was immediately saved, they technically have.
   */
  return useMemo((): {
    data: {
      [usersAddress: string]: boolean
    }
    isFetched: boolean
  } => {
    if (
      !isDrawIdsFetched ||
      !usersAddress ||
      !prizeDistributor ||
      !isNormalizedBalancesFetched ||
      !Boolean(normalizedBalancesData?.[usersAddress]) ||
      !isClaimedAmountsFetched ||
      usersAddress !== claimedAmountsData?.usersAddress
    ) {
      return { data: null, isFetched: false }
    }

    const { claimedAmounts } = claimedAmountsData
    const normalizedBalances = normalizedBalancesData[usersAddress]

    if (!claimedAmounts || !normalizedBalances) {
      return { data: null, isFetched: false }
    }

    const drawResults = getStoredDrawResults(usersAddress, prizeDistributor)
    const claimedDrawIds: number[] = []

    Object.keys(claimedAmounts).forEach((drawId) => {
      const amount = claimedAmounts[drawId]
      if (!amount.amountUnformatted.isZero()) {
        claimedDrawIds.push(Number(drawId))
      }
    })
    const checkedDrawIds = Object.keys(drawResults).map(Number)
    const drawIdsWithoutANormalizedBalance: number[] = []
    Object.keys(normalizedBalances)
      .map(Number)
      .forEach((drawId) => {
        if (normalizedBalances[drawId].isZero()) {
          drawIdsWithoutANormalizedBalance.push(drawId)
        }
      })
    const hasUserCheckedAllDraws = drawIds.every(
      (drawId) =>
        checkedDrawIds.includes(drawId) ||
        claimedDrawIds.includes(drawId) ||
        drawIdsWithoutANormalizedBalance.includes(drawId)
    )
    return {
      data: {
        [usersAddress]: hasUserCheckedAllDraws
      },
      isFetched: true
    }
  }, [
    usersAddress,
    isClaimedAmountsFetched,
    isDrawIdsFetched,
    isNormalizedBalancesFetched,
    claimedAmountsData,
    drawIds,
    normalizedBalancesData,
    prizeDistributor?.id()
  ])
}
