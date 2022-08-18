import { BigNumber, ethers } from 'ethers'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersPrizePoolTwab } from './useUsersPrizePoolTwab'
import { EstimateAction } from '@constants/odds'
import { usePrizePoolOdds } from './usePrizePoolOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolOdds = (
  usersAddress: string,
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: twabData, isFetched: isTwabDataFetched } = useUsersPrizePoolTwab(
    usersAddress,
    prizePool
  )
  return usePrizePoolOdds(twabData?.twab, prizePool, action, actionAmountUnformatted)
}
