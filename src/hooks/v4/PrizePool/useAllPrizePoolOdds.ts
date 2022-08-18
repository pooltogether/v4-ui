import { BigNumber } from 'ethers'
import { EstimateAction } from '../../../constants/odds'
import { useQueries } from 'react-query'
import { usePrizePools } from './usePrizePools'
import { useAllPrizePoolOddsData } from './useAllPrizePoolOddsData'
import { useAllUsersPrizePoolTwabs } from './useUsersPrizePoolTwab'
import { getOdds, getOddsKey } from './useOdds'
import { Amount } from '@pooltogether/hooks'

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
