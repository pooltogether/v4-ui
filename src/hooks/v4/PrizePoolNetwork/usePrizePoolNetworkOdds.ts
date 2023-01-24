import { unionProbabilities } from '@utils/unionProbabilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { usePrizePoolNetwork } from './usePrizePoolNetwork'
import { EstimateAction } from '../../../constants/odds'
import { useAllUsersPrizePoolOdds } from '../PrizePool/useAllUsersPrizePoolOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const usePrizePoolNetworkOdds = (
  allOddsData: { odds: number; oneOverOdds: number }[],
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  return useQuery(
    [
      'usePrizePoolNetworkOdds',
      allOddsData.map(({ odds }) => odds || '').join('-'),
      Object.keys(actions)?.join('-'),
      Object.values(actions)
        ?.map(({ action, actionAmountUnformatted }) => action + actionAmountUnformatted?.toString())
        .join('-')
    ],
    () => {
      const unionedOdds = unionProbabilities(...allOddsData.map(({ odds }) => odds))
      const oneOverOdds = 1 / unionedOdds

      return {
        odds: unionedOdds,
        oneOverOdds
      }
    },
    { enabled: !!allOddsData }
  )
}
