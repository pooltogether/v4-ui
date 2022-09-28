import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { EstimateAction } from '../../../constants/odds'
import { useAllUsersPrizePoolOdds } from '../PrizePool/useAllUsersPrizePoolOdds'
import { usePrizePoolNetworkOdds } from './usePrizePoolNetworkOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolNetworkOdds = (
  usersAddress: string,
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const queryResults = useAllUsersPrizePoolOdds(usersAddress, actions)
  const allOddsData = useMemo(
    () => queryResults.filter(({ isFetched }) => isFetched).map(({ data }) => data),
    [queryResults]
  )
  return usePrizePoolNetworkOdds(allOddsData, actions)
}
