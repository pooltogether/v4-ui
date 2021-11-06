import { Amount } from '@pooltogether/hooks'
import { calculateOdds } from '@pooltogether/utilities'
import { useMemo } from 'react'
import { useOddsData } from './useOddsData'

// TODO: Accept number, string or Amount. If string, convert to Amount and
//       use useTicketDecimals.
export const useEstimatedOddsForDepositAmount = (amount: Amount) => {
  const { data, isFetched } = useOddsData()
  return useMemo(() => {
    if (!isFetched || !amount) {
      return {
        isFetched: false,
        data: undefined
      }
    }
    const { numberOfPrizes, decimals, totalSupply } = data
    const odds = calculateOdds(
      amount.amountUnformatted,
      totalSupply.amountUnformatted,
      decimals,
      numberOfPrizes
    )
    const oneOverOdds = 1 / odds
    return {
      isFetched: true,
      data: {
        odds,
        oneOverOdds
      }
    }
  }, [isFetched, amount])
}
