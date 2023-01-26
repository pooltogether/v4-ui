import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useAllUsersClaimedAmounts } from './useAllUsersClaimedAmounts'
import { useSelectedPrizePoolTicketDecimals } from '../PrizePool/useSelectedPrizePoolTicketDecimals'

/**
 * NOTE: Legacy hook.  Use useUsersTotalClaimedAmountGraph instead. This reads from chain data which uses a buffer that will get overwritten.
 * @param usersAddress
 * @returns
 */
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
  const totalClaimedAmount = getAmountFromUnformatted(totalClaimedAmountUnformatted, decimals)
  return {
    data: totalClaimedAmount,
    isFetched: true
  }
}
