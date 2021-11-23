import { DrawResults, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useMemo } from 'react'

import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'

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
  const { data: claimedAmountsData, isFetched: isClaimedAmountsFetched } = useUsersClaimedAmounts(
    usersAddress,
    prizeDistributor
  )
  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor)
  const drawResults = storedDrawResults?.[usersAddress]

  return useMemo(() => {
    const claimedAmounts = claimedAmountsData?.[usersAddress]
    if (!isClaimedAmountsFetched || !usersAddress || !prizeDistributor) {
      return { data: null, isFetched: false }
    }
    const unclaimedWinningDrawResults: { [drawId: number]: DrawResults } = {}
    Object.keys(drawResults)
      .map(Number)
      .forEach((drawId) => {
        const claimedAmount = claimedAmounts[drawId]
        const drawResult = drawResults[drawId]
        if (claimedAmount.amountUnformatted.isZero() && !drawResult.totalValue.isZero()) {
          unclaimedWinningDrawResults[drawId] = drawResult
        }
      })
    return {
      data: { [usersAddress]: unclaimedWinningDrawResults },
      isFetched: true
    }
  }, [prizeDistributor?.id(), usersAddress, claimedAmountsData, drawResults])
}
