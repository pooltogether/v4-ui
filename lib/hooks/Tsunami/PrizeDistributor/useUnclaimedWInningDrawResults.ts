import { DrawResults, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useMemo } from 'react'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersStoredDrawResults } from './useUsersStoredDrawResults'

export const useUsersUnclaimedWinningDrawResults = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const { data: claimedAmounts, isFetched: isClaimedAmountsFetched } =
    useUsersClaimedAmounts(prizeDistributor)
  const drawResults = useUsersStoredDrawResults(prizeDistributor)

  return useMemo(() => {
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
      data: unclaimedWinningDrawResults,
      isFetched: true
    }
  }, [prizeDistributor?.id(), usersAddress, claimedAmounts, drawResults])
}
