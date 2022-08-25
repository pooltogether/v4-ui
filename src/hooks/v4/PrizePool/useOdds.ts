import { EstimateAction } from '@constants/odds'
import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { estimateOddsForAmount } from '@utils/estimateOddsForAmount'
import { BigNumber, ethers } from 'ethers'
import { useQuery } from 'react-query'

/**
 * Calculates the overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useOdds = (
  prizePool: PrizePool,
  totalSupply: Amount,
  twab: Amount,
  numberOfPrizes: number,
  decimals: string,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const enabled = !!twab && !!totalSupply && !!numberOfPrizes && !!decimals

  return useQuery(
    getOddsKey(totalSupply, twab, numberOfPrizes, action, actionAmountUnformatted),
    () =>
      getOdds(
        prizePool,
        totalSupply,
        twab,
        numberOfPrizes,
        decimals,
        action,
        actionAmountUnformatted
      ),
    { enabled }
  )
}

export const getOddsKey = (
  twab: Amount,
  totalSupply: Amount,
  numberOfPrizes: number,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => [
  'usePrizePoolOdds',
  action,
  actionAmountUnformatted?.toString(),
  twab?.amount,
  totalSupply?.amount,
  numberOfPrizes
]

export const getOdds = (
  prizePool: PrizePool,
  totalSupply: Amount,
  twab: Amount,
  numberOfPrizes: number,
  decimals: string,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { odds, oneOverOdds } = estimateOddsForAmount(
    twab,
    totalSupply,
    numberOfPrizes,
    decimals,
    action,
    actionAmountUnformatted
  )

  return {
    prizePoolId: prizePool.id(),
    odds,
    oneOverOdds
  }
}
