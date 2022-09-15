import { BigNumber } from 'ethers'
import { useQueries } from 'react-query'

import { EstimateAction } from '../../../constants/odds'
import { useAllPrizePoolOddsData } from './useAllPrizePoolOddsData'
import { usePrizePools } from './usePrizePools'
import { getUsersPrizePoolOdds, getUsersPrizePoolOddsKey } from './useUsersPrizePoolOdds'
import { useAllUsersPrizePoolTwabs } from './useUsersPrizePoolTwab'

/**
 * Calculates the users overall chances of winning a prize on any network
 * TODO: Add actions
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useAllUsersPrizePoolOdds = (
  usersAddress: string,
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const prizePools = usePrizePools()
  const allUsersPrizePoolTwabsQueryResults = useAllUsersPrizePoolTwabs(usersAddress)
  const allPrizePoolOddsDatasQueryResult = useAllPrizePoolOddsData()

  const isPrizePoolTwabsFetched = allUsersPrizePoolTwabsQueryResults.every(
    ({ isFetched }) => isFetched
  )
  const isPrizePoolOddsDataFetched = allUsersPrizePoolTwabsQueryResults.every(
    ({ isFetched }) => isFetched
  )

  const enabled = isPrizePoolTwabsFetched && isPrizePoolOddsDataFetched

  return useQueries(
    enabled
      ? prizePools.map((prizePool) => {
          const twabQueryResult = allUsersPrizePoolTwabsQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const oddsDataQueryResult = allPrizePoolOddsDatasQueryResult.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )

          const oddsData = oddsDataQueryResult?.data
          const twabData = twabQueryResult?.data
          const action = actions[prizePool.id()]?.action
          const actionAmountUnformatted = actions[prizePool.id()]?.actionAmountUnformatted

          return {
            queryKey: getUsersPrizePoolOddsKey(
              usersAddress,
              prizePool,
              twabData?.twab,
              oddsData?.totalSupply,
              oddsData?.numberOfPrizes,
              action,
              actionAmountUnformatted
            ),
            queryFn: () => {
              return getUsersPrizePoolOdds(
                usersAddress,
                prizePool,
                oddsData,
                twabData,
                action,
                actionAmountUnformatted
              )
            },
            enabled: enabled && !!oddsData && !!twabData
          }
        })
      : []
  )
}
