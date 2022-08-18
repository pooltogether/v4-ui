import { BigNumber, ethers } from 'ethers'
import { usePrizePoolOddsData } from './usePrizePoolOddsData'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Amount } from '@pooltogether/hooks'
import { EstimateAction } from '@constants/odds'
import { useOdds } from './useOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const usePrizePoolOdds = (
  twab: Amount,
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: oddsData } = usePrizePoolOddsData(prizePool)
  return useOdds(
    oddsData?.totalSupply,
    twab,
    oddsData?.numberOfPrizes,
    oddsData?.decimals,
    action,
    actionAmountUnformatted
  )
}
