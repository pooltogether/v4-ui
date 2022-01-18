import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useTicketDecimals } from '../PrizePool/useTicketDecimals'
import { useAllUsersClaimedAmounts } from './useAllUsersClaimedAmounts'

export const useUsersTotalClaimedAmount = (usersAddress: string) => {
  const { data: decimals, isFetched: isDecimalsFetched } = useTicketDecimals()
  const claimedAmountsQueryResults = useAllUsersClaimedAmounts(usersAddress)
  const isClaimedAmountsFetched = claimedAmountsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  if (!isClaimedAmountsFetched || !isDecimalsFetched) {
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
