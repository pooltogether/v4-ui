import { BigNumber } from 'ethers'
import { parseUnits } from '@ethersproject/units'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useSelectedPrizePoolTicketDecimals } from '../PrizePool/useSelectedPrizePoolTicketDecimals'
import { useAllUsersClaimedAmountsGraph } from './useAllUsersClaimedAmountsGraph'

export const useUsersTotalClaimedAmountGraph = (usersAddress: string) => {
  const { data: decimals, isFetched: isDecimalsFetched } = useSelectedPrizePoolTicketDecimals()
  const claimedAmountsQueryResults = useAllUsersClaimedAmountsGraph(usersAddress)
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

  const totalClaimedAmountUnformatted = claimedAmountsQueryResults.reduce(
    (accumulator, queryResult) => {
      const totalClaimed = queryResult.data.totalClaimed

      if (Boolean(totalClaimed)) {
        const totalClaimedUnformatted = BigNumber.from(queryResult.data.totalClaimed)

        return accumulator.add(totalClaimedUnformatted)
      } else {
        return accumulator
      }
    },
    BigNumber.from(0)
  )

  const totalClaimedAmount = getAmountFromBigNumber(totalClaimedAmountUnformatted, decimals)
  return {
    data: totalClaimedAmount,
    isFetched: true
  }
}
