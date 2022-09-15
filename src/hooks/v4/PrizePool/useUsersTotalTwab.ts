import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { Amount } from '@pooltogether/hooks'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useAllUsersPrizePoolTwabs } from './useUsersPrizePoolTwab'

/**
 * Fetches the users current TWAB across all chains and combines
 * NOTE: Assumes all prize pool tickets have the same decimals
 * @param usersAddress
 * @returns
 */
export const useUsersTotalTwab = (usersAddress: string) => {
  // NOTE: Assumes all prize pool tickets have the same decimals
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

  const queryResults = useAllUsersPrizePoolTwabs(usersAddress)
  const queryKey = queryResults
    .map((qr) => qr.data?.prizePoolId + qr.data?.usersAddress + qr.data?.twab.amount)
    .join('-')

  return useMemo(() => {
    const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
    const isFetching = queryResults.some((queryResult) => queryResult.isFetching)
    const twabDataPerChain = queryResults.map((queryResults) => queryResults.data)
    const refetch = () => queryResults.forEach((queryResult) => queryResult.refetch())

    const twabAmounts: Amount[] = []
    twabDataPerChain.forEach((twabData) => {
      if (twabData && !twabData.twab.amountUnformatted.isZero()) {
        twabAmounts.push(twabData.twab)
      }
    })
    const twab = getTotalTwab(twabAmounts, ticketDecimals)

    return {
      data: {
        usersAddress,
        twab,
        twabDataPerChain
      },
      isFetching,
      isFetched,
      refetch
    }
  }, [queryKey])
}

const getTotalTwab = (twabs: Amount[], decimals: string) => {
  let total = ethers.constants.Zero
  twabs.forEach((twab) => {
    if (!twab || twab.amountUnformatted.isZero()) return
    total = total.add(twab.amountUnformatted)
  })
  return getAmountFromBigNumber(total, decimals)
}
