import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useEffect, useMemo, useState } from 'react'

import { getStoredDrawResults } from '@utils/drawResultsStorage'
import { useUnclaimedDrawIds } from './useUnclaimedDrawIds'
import { useUsersClaimedAmounts } from './useUsersClaimedAmounts'
import { useUsersPickCounts } from './useUsersPickCounts'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolTicket } from '../PrizePool/useSelectedPrizePoolTicket'

/**
 * TODO: useState, set once data is loaded on mount, check if it is set, if it is, don't overwrite.
 * @param prizeDistributor
 * @returns
 */
export const useHasUserCheckedAllDraws = (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2
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
  const { data: ticket } = useSelectedPrizePoolTicket()
  const { data: pickCountsData, isFetched: isPickCountsFetched } = useUsersPickCounts(
    usersAddress,
    ticket?.address,
    prizeDistributor
  )

  const claimedAmounts = claimedAmountsData?.claimedAmounts
  const pickCounts = pickCountsData?.pickCounts

  const isDataFetched =
    usersAddress &&
    isDrawIdsFetched &&
    isClaimedAmountsFetched &&
    isPickCountsFetched &&
    Boolean(prizeDistributor) &&
    usersAddress === claimedAmountsData?.usersAddress &&
    usersAddress === pickCountsData?.usersAddress

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
      Object.keys(pickCounts)
        .map(Number)
        .forEach((drawId) => {
          if (pickCounts[drawId].isZero()) {
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
