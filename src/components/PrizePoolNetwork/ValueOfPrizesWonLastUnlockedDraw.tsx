import { CurrencyValue } from '@components/CurrencyValue'
import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useAllLatestUnlockedDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
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
    <CurrencyValue
      baseValue={formatUnits(valueOfPrizesWonLastDraw, decimals)}
      options={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
    />
  )
}
