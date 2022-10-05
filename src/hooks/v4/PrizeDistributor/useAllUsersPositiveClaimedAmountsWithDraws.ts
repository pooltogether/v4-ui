import { Amount, Token } from '@pooltogether/hooks'
import { Draw } from '@pooltogether/v4-client-js'
import { useAllUsersClaimedAmounts } from './useAllUsersClaimedAmounts'
import { useAllValidDraws } from './useAllValidDraws'
import { usePrizeDistributors } from './usePrizeDistributors'

export const useAllUsersPositiveClaimedAmountsWithDraws = (usersAddress: string) => {
  const prizeDistributors = usePrizeDistributors()
  const claimedAmountsQueryResults = useAllUsersClaimedAmounts(usersAddress)
  const availableDrawsQueryResults = useAllValidDraws()

  const isClaimedAmountsFetched = claimedAmountsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  const isAvailableDrawsFetched = availableDrawsQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  if (!isClaimedAmountsFetched || !isAvailableDrawsFetched) {
    return {
      data: null,
      isFetched: false
    }
  }

  const claimedAmountsAndDraws: {
    token: Token
    prizeDistributorId
    chainId: number
    drawId: number
    claimedAmount: Amount
    draw: Draw
  }[] = []

  prizeDistributors.forEach((prizeDistributor) => {
    const chainId = prizeDistributor.chainId
    const prizeDistributorId = prizeDistributor.id()

    const drawQueryResult = availableDrawsQueryResults.find(
      (queryResult) => queryResult.data.prizeDistributorId === prizeDistributorId
    )
    const claimedAmountsQueryResult = claimedAmountsQueryResults.find(
      (queryResult) => queryResult.data.prizeDistributorId === prizeDistributorId
    )

    const draws = drawQueryResult.data.draws
    const claimedAmounts = claimedAmountsQueryResult.data.claimedAmounts
    const token = claimedAmountsQueryResult.data.token

    Object.keys(claimedAmounts).forEach((_drawId) => {
      const drawId = Number(_drawId)
      const claimedAmount = claimedAmounts[drawId]
      if (!claimedAmount.amountUnformatted.isZero()) {
        const draw = draws[drawId]
        claimedAmountsAndDraws.push({
          token,
          prizeDistributorId,
          chainId,
          drawId,
          claimedAmount,
          draw
        })
      }
    })
  })

  return {
    data: claimedAmountsAndDraws.reverse(),
    isFetched: true
  }
}
