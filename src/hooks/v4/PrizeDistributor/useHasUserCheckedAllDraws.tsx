import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useEffect, useMemo, useState } from 'react'

import { getStoredDrawResults } from '@utils/drawResultsStorage'
import { useUnclaimedDrawIds } from './useUnclaimedDrawIds'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from './useUsersNormalizedBalances'
import { useSelectedChainId } from '@hooks/useSelectedChainId'

/**
 * TODO: useState, set once data is loaded on mount, check if it is set, if it is, don't overwrite.
 * @param prizeDistributor
 * @returns
 */
export const useHasUserCheckedAllDraws = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  const { chainId } = useSelectedChainId()
  const [hasUserCheckedAllDraws, setHasUserCheckedAllDraws] = useState(null)
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

  const claimedAmounts = claimedAmountsData?.claimedAmounts
  const normalizedBalances = normalizedBalancesData?.normalizedBalances

  const isDataFetched =
    usersAddress &&
    isDrawIdsFetched &&
    isClaimedAmountsFetched &&
    isNormalizedBalancesFetched &&
    Boolean(prizeDistributor) &&
    usersAddress === claimedAmountsData?.usersAddress &&
    usersAddress === normalizedBalancesData?.usersAddress

  // Clear state when chain id or users address updates
  useEffect(() => {
    setHasUserCheckedAllDraws(null)
  }, [chainId, usersAddress])

  useEffect(() => {
    // When data is fetched, set the state
    if (isDataFetched && hasUserCheckedAllDraws === null) {
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
      setHasUserCheckedAllDraws(hasUserCheckedAllDraws)
    }
  }, [isDataFetched, hasUserCheckedAllDraws])

  if (hasUserCheckedAllDraws === null) {
    return {
      data: null,
      isFetched: false
    }
  } else {
    return {
      data: {
        usersAddress,
        hasUserCheckedAllDraws
      },
      isFetched: isDataFetched
    }
  }
}
