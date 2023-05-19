import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useAllUsersClaimedAmountsGraph } from './useAllUsersClaimedAmountsGraph'
import { useSelectedPrizePoolTicketDecimals } from '../PrizePool/useSelectedPrizePoolTicketDecimals'

export const useUsersTotalClaimedAmountGraph = (usersAddress: string) => {
  const { data: decimals, isFetched: isDecimalsFetched } = useSelectedPrizePoolTicketDecimals()
  const claimedAmountsQueryResults = useAllUsersClaimedAmountsGraph(usersAddress)
  const isClaimedAmountsFetched = claimedAmountsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  const isError = claimedAmountsQueryResults.some((result) => result.isError)

  return useMemo(() => {
    if (!isClaimedAmountsFetched || !isDecimalsFetched || isError) {
      return {
        data: null,
        isFetched: false,
        isError
      }
    }

    const { totalClaimedAmountUnformatted, totalClaimedPrizes } = claimedAmountsQueryResults.reduce(
      (accumulator, queryResult) => {
        const totalClaimed = queryResult.data?.totalClaimed

        if (!!totalClaimed) {
          const totalClaimedUnformatted = BigNumber.from(totalClaimed)

          return {
            totalClaimedAmountUnformatted:
              accumulator.totalClaimedAmountUnformatted.add(totalClaimedUnformatted),
            totalClaimedPrizes:
              accumulator.totalClaimedPrizes + Object.keys(queryResult.data.claimedAmounts).length
          }
        } else {
          return accumulator
        }
      },
      { totalClaimedAmountUnformatted: BigNumber.from(0), totalClaimedPrizes: 0 }
    )

    const totalClaimedAmount = getAmountFromUnformatted(totalClaimedAmountUnformatted, decimals)

    return {
      data: { totalClaimedAmount, totalClaimedPrizes },
      isFetched: true,
      isError
    }
  }, [claimedAmountsQueryResults, decimals, isClaimedAmountsFetched, isDecimalsFetched, isError])
}
