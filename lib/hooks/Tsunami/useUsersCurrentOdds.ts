import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { BigNumber, ethers } from 'ethers'
import { useUsersCurrentPrizePoolTwab } from './PrizePool/useUsersCurrentPrizePoolTwab'
import { EstimateAction, useEstimatedOddsForAmount } from './useEstimatedOddsForAmount'

/**
 * Calculates the users odds for a specific prize pool
 * @param prizePool
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersCurrentOdds = (
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  amountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: twab } = useUsersCurrentPrizePoolTwab(prizePool)
  return useEstimatedOddsForAmount(prizePool, twab, action, amountUnformatted)
}
