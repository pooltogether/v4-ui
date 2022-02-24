import { DrawResults, PrizeDistributor } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'

import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Returns a users unclaimed winning draw results for valid draw ids
 * @param usersAddress
 * @param prizeDistributor
 * @returns
 */
export const useUsersUnclaimedWinningDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
): {
  data: {
    [usersAddress: string]: {
      [drawId: number]: DrawResults
    }
  }
  isFetched: boolean
} => {
  const { data: drawIdData, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const { data: claimedAmountsData, isFetched: isClaimedAmountsFetched } = useUsersClaimedAmounts(
    usersAddress,
    prizeDistributor
  )
  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor)
  const drawResults = storedDrawResults?.[usersAddress]

  return useMemo(() => {
    if (
      !usersAddress ||
      !prizeDistributor ||
      !isClaimedAmountsFetched ||
      !isDrawIdsFetched ||
      usersAddress !== claimedAmountsData?.usersAddress ||
      drawIdData.prizeDistributorId !== prizeDistributor.id()
    ) {
      return { data: null, isFetched: false }
    }
    const claimedAmounts = claimedAmountsData.claimedAmounts
    const unclaimedWinningDrawResults: { [drawId: number]: DrawResults } = {}
    drawIdData.drawIds.forEach((drawId) => {
      const claimedAmount = claimedAmounts[drawId]
      const drawResult = drawResults[drawId]
      // Locked draws will be returned in claimed amount but not draw result since we block checking in the UI until the timelock finishes
      if (
        claimedAmount &&
        drawResult &&
        claimedAmount.amountUnformatted.isZero() &&
        !drawResult.totalValue.isZero()
      ) {
        unclaimedWinningDrawResults[drawId] = drawResult
      }
    })
    return {
      data: { [usersAddress]: unclaimedWinningDrawResults },
      isFetched: true
    }
  }, [prizeDistributor?.id(), usersAddress, claimedAmountsData, drawResults])
}
