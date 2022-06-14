import { Amount } from '@pooltogether/hooks'
import { calculateOdds } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'
import { useMemo } from 'react'
import { useSelectedPrizePool } from '../PrizePool/useSelectedPrizePool'

import { usePrizePoolOddsData } from './usePrizePoolOddsData'

export enum EstimateAction {
  none = 'NONE',
  withdraw = 'WITHDRAW',
  deposit = 'DEPOSIT'
}

export const useEstimatedOddsForAmount = (
  amount: Amount,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const prizePool = useSelectedPrizePool()
  const data = usePrizePoolOddsData(prizePool)

  return useMemo(() => {
    if (!Boolean(data) || amount === undefined || amount === null) {
      return {
        isFetched: false,
        data: undefined
      }
    }
    const { numberOfPrizes, decimals, totalSupply } = data
    return {
      isFetched: true,
      data: estimateOddsForAmount(
        amount,
        totalSupply,
        numberOfPrizes,
        decimals,
        action,
        changeAmountUnformatted
      )
    }
  }, [data, amount])
}

/**
 * NOTE: Odds per prize pool change if there are different numbers of prizes in different prize pools
 *
 * @param amount
 * @param totalSupply
 * @param numberOfPrizes
 * @param decimals
 * @param action
 * @param changeAmountUnformatted
 * @returns
 */
export const estimateOddsForAmount = (
  amount: Amount,
  totalSupply: Amount,
  numberOfPrizes: number,
  decimals: string,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  let totalSupplyUnformatted
  let amountUnformatted
  if (action === EstimateAction.withdraw) {
    amountUnformatted = amount.amountUnformatted.sub(changeAmountUnformatted)
    totalSupplyUnformatted = totalSupply.amountUnformatted.sub(changeAmountUnformatted)
  } else if (action === EstimateAction.deposit) {
    amountUnformatted = amount.amountUnformatted.add(changeAmountUnformatted)
    totalSupplyUnformatted = totalSupply.amountUnformatted.add(changeAmountUnformatted)
  } else {
    amountUnformatted = amount.amountUnformatted
    totalSupplyUnformatted = totalSupply.amountUnformatted
  }

  console.log('estimateOddsForAmount', {
    amountUnformatted,
    totalSupplyUnformatted,
    decimals,
    numberOfPrizes
  })
  const odds = calculateOdds(amountUnformatted, totalSupplyUnformatted, decimals, numberOfPrizes)
  const oneOverOdds = 1 / odds
  return {
    odds,
    oneOverOdds
  }
}
