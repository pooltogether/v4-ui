import { Amount } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'
import { useQueries } from 'react-query'

import { EstimateAction } from '../../../constants/odds'
import { useAllPrizePoolOddsData } from './useAllPrizePoolOddsData'
import { getOdds, getOddsKey } from './useOdds'
import { usePrizePools } from './usePrizePools'
import { useAllUsersPrizePoolTwabs } from './useUsersPrizePoolTwab'

/**
 * Calculates the users overall chances of winning a prize on any network
 * TODO: Add actions
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useAllPrizePoolOdds = (
  twabs: { [prizePoolId: string]: Amount },
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const prizePools = usePrizePools()
  const allPrizePoolOddsDatasQueryResult = useAllPrizePoolOddsData()

  return useQueries(
    prizePools.map((prizePool) => {
      const oddsDataQueryResult = allPrizePoolOddsDatasQueryResult.find(
        (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
      )

      const twab = twabs?.[prizePool.id()]
      const oddsData = oddsDataQueryResult?.data
      const action = actions[prizePool.id()]?.action
      const actionAmountUnformatted = actions[prizePool.id()]?.actionAmountUnformatted

      return {
        queryKey: getOddsKey(
          twab,
          oddsData?.totalSupply,
          oddsData?.numberOfPrizes,
          action,
          actionAmountUnformatted
        ),
        queryFn: () => {
          return getOdds(
            prizePool,
            oddsData?.totalSupply,
            twab,
            oddsData?.numberOfPrizes,
            oddsData?.decimals,
            action,
            actionAmountUnformatted
          )
        },
        enabled: !!oddsData && !!twab
      }
    })
  )
}
