import { BigNumber } from 'ethers'
import { useQueries } from 'react-query'
import { EstimateAction } from '../../../constants/odds'
import { useAllPrizePoolTicketTwabTotalSupplies } from './useAllPrizePoolTicketTwabTotalSupplies'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { useAllPrizePoolExpectedPrizes } from './useAllPrizePoolExpectedPrizes'
import { getPrizePoolOddsData, getPrizePoolOddsDataKey } from './usePrizePoolOddsData'

import { usePrizePools } from './usePrizePools'

export const useAllPrizePoolOddsData = (
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const prizePools = usePrizePools()
  const allTwabQueryResults = useAllPrizePoolTicketTwabTotalSupplies()
  const allNumberOfPrizesQueryResults = useAllPrizePoolExpectedPrizes()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()

  const isTwabFetched = allTwabQueryResults.every(({ isFetched }) => isFetched)
  const isNumberOfPrizesFetched = allNumberOfPrizesQueryResults.every(({ isFetched }) => isFetched)
  const isPrizePoolTokensFetched = allPrizePoolTokensQueryResults.every(
    ({ isFetched }) => isFetched
  )
  const enabled = isTwabFetched && isNumberOfPrizesFetched && isPrizePoolTokensFetched

  return useQueries(
    enabled
      ? prizePools.map((prizePool) => {
          const twabQueryResult = allTwabQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const numberOfPrizesQueryResult = allNumberOfPrizesQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const tokensQueryResult = allPrizePoolTokensQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const action = actions[prizePool.id()]?.action
          const actionAmountUnformatted = actions[prizePool.id()]?.actionAmountUnformatted

          return {
            queryKey: getPrizePoolOddsDataKey(
              prizePool,
              twabQueryResult?.data?.amount.amount,
              numberOfPrizesQueryResult?.data?.expectedTotalNumberOfPrizes,
              action,
              actionAmountUnformatted?.toString()
            ),
            queryFn: () =>
              getPrizePoolOddsData(
                prizePool,
                tokensQueryResult?.data?.ticket.decimals,
                twabQueryResult?.data?.amount,
                numberOfPrizesQueryResult?.data?.expectedTotalNumberOfPrizes
              ),
            enabled
          }
        })
      : []
  )
}
