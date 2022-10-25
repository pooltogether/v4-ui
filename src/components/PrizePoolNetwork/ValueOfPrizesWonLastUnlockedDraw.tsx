import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useAllLatestUnlockedDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { ethers } from 'ethers'
import { useMemo } from 'react'

/**
 * NOTE: Assumes same token for all prize pools
 * @returns
 */
export const ValueOfPrizesWonLastUnlockedDraw = () => {
  const queryResults = useAllLatestUnlockedDrawWinnersInfo()
  const prizePool = useSelectedPrizePool()
  const { data: decimals } = usePrizePoolTicketDecimals(prizePool)
  const valueOfPrizesWonLastDraw = useMemo(
    () =>
      queryResults.reduce((total, { data, isFetched, isError }) => {
        if (!isFetched || isError) {
          return total
        }
        return total.add(data.amount.amountUnformatted)
      }, ethers.constants.Zero),
    [queryResults]
  )
  return (
    <>
      {formatUnformattedBigNumberForDisplay(valueOfPrizesWonLastDraw, decimals, {
        style: 'currency',
        currency: 'usd'
      })}
    </>
  )
}
