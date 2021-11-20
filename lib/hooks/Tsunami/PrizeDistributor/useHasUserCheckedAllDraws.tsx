import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResults } from 'lib/utils/drawResultsStorage'
import { useMemo } from 'react'
import { useUnlockedDrawIds } from './useUnlockedDrawIds'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'
import { useValidDrawIds } from './useValidDrawIds'

/**
 *
 * @param prizeDistributor
 * @returns
 */
export const useHasUserCheckedAllDraws = (prizeDistributor: PrizeDistributor) => {
  const { data: drawIds, isFetched: isDrawIdsFetched } = useUnlockedDrawIds(prizeDistributor)
  const { data: claimedAmounts, isFetched: isClaimedAmountsFetched } =
    useUsersClaimedAmounts(prizeDistributor)
  const { data: normalizedBalances, isFetched: isNormalizedBalancesFetched } =
    useUsersNormalizedBalances(prizeDistributor)
  const usersAddress = useUsersAddress()

  /**
   * This is kind of cheeky. We're reading straight from local storage to get the "checked" draw results (Draw results for draws that the user has clicked "Check for prizes" on). If the user hasn't checked the draw before we fetch them when the user clicks "Check for prizes" and then store them in the local storage. This update to local storage WILL NOT trigger this useMemo to rerun. We want that. Otherwise there ma be some other state jumps where the UI expects thte user to not have checked all before, but becaues it was immediately saved, they technically have.
   */
  return useMemo(() => {
    if (
      !isDrawIdsFetched ||
      !usersAddress ||
      !isClaimedAmountsFetched ||
      !prizeDistributor ||
      !isNormalizedBalancesFetched
    ) {
      return { data: null, isFetched: false }
    }
    const drawResults = getStoredDrawResults(usersAddress, prizeDistributor)
    const claimedDrawIds = []

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
    return { data: hasUserCheckedAllDraws, isFetched: true }
  }, [
    usersAddress,
    isClaimedAmountsFetched,
    isDrawIdsFetched,
    isNormalizedBalancesFetched,
    claimedAmounts,
    drawIds,
    normalizedBalances,
    prizeDistributor?.id()
  ])
}
