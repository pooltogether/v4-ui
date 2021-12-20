import { BigNumber, ethers } from 'ethers'
import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/v4/PrizePool/useUsersCurrentPrizePoolTwabs'
import { EstimateAction, estimateOddsForAmount } from './useEstimatedOddsForAmount'
import { useOverallOddsData } from './useOverallOddsData'

/**
 * Calculates hte users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork = (
  usersAddress: string,
  action: EstimateAction = EstimateAction.none,
  amountUnformatted: BigNumber = ethers.constants.Zero,
  daysOfPrizes: number = 1
): {
  [usersAddress: string]: {
    odds: number
    oneOverOdds: number
  }
} => {
  const { data: twabsData, isFetched: isTwabsFetched } = useUsersCurrentPrizePoolTwabs(usersAddress)
  const data = useOverallOddsData()
  const twabs = twabsData?.[usersAddress]
  if (!isTwabsFetched || !data || !twabs) {
    return undefined
  }
  const { totalSupply, numberOfPrizes, decimals } = data
  return {
    [usersAddress]: estimateOddsForAmount(
      twabs.total,
      totalSupply,
      numberOfPrizes * daysOfPrizes,
      decimals,
      action,
      amountUnformatted
    )
  }
}
