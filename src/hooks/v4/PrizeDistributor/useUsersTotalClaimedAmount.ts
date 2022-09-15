import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { BigNumber } from 'ethers'

import { useSelectedPrizePoolTicketDecimals } from '../PrizePool/useSelectedPrizePoolTicketDecimals'
import { useAllUsersClaimedAmounts } from './useAllUsersClaimedAmounts'

export const useUsersTotalClaimedAmount = (usersAddress: string) => {
  const { data: decimals, isFetched: isDecimalsFetched } = useSelectedPrizePoolTicketDecimals()
  const claimedAmountsQueryResults = useAllUsersClaimedAmounts(usersAddress)
  const isClaimedAmountsFetched = claimedAmountsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  const isError = claimedAmountsQueryResults.some((result) => result.isError)

  if (!isClaimedAmountsFetched || !isDecimalsFetched || isError) {
    return {
      data: null,
      isFetched: false
    }
  }

  const totalClaimedAmountUnformatted = claimedAmountsQueryResults.reduce((acc, curr) => {
    const prizePoolClaimedAmounts = Object.values(curr.data.claimedAmounts)
    const totalClaimedForPrizePool = prizePoolClaimedAmounts.reduce((acc, curr) => {
      return acc.add(curr.amountUnformatted)
    }, BigNumber.from(0))
    return acc.add(totalClaimedForPrizePool)
  }, BigNumber.from(0))
  const totalClaimedAmount = getAmountFromBigNumber(totalClaimedAmountUnformatted, decimals)
  return {
    data: totalClaimedAmount,
    isFetched: true
  }
}
