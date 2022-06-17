import { Amount } from '@pooltogether/hooks'
import { calculateOdds } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'
import { useMemo } from 'react'
import { usePrizePoolNetworkOddsData } from './usePrizePoolNetworkOddsData'

export enum EstimateAction {
  none = 'NONE',
  withdraw = 'WITHDRAW',
  deposit = 'DEPOSIT'
}

export const usePrizePoolNetworkEstimatedOddsForAmount = (
  amount: Amount,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  // TODO: Fix so this cna be used for multiple networks
  // const data = useOddsData(prizePool)
  const data = usePrizePoolNetworkOddsData()

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
