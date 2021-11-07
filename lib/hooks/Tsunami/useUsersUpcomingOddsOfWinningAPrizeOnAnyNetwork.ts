import { BigNumber, ethers } from 'ethers'
import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { EstimateAction, estimateOddsForAmount } from './useEstimatedOddsForAmount'
import { useOverallOddsData } from './useOverallOddsData'

/**
 * Calculates hte users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork = (
  action: EstimateAction = EstimateAction.none,
  amountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: twabs, isFetched: isTwabsFetched } = useUsersCurrentPrizePoolTwabs()
  const data = useOverallOddsData()
  if (!isTwabsFetched || !data) {
    return undefined
  }
  const { totalSupply, numberOfPrizes, decimals } = data
  return estimateOddsForAmount(
    twabs.total,
    totalSupply,
    numberOfPrizes,
    decimals,
    action,
    amountUnformatted
  )
}
