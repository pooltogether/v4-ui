import { EstimateAction } from '@constants/odds'
import { Amount } from '@pooltogether/hooks'
import { calculateOdds } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'

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

  const odds = calculateOdds(amountUnformatted, totalSupplyUnformatted, decimals, numberOfPrizes)
  const oneOverOdds = 1 / odds
  return {
    odds,
    oneOverOdds
  }
}
