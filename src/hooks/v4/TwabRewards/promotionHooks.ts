import { useMemo } from 'react'
import { sToD, msToS } from '@pooltogether/utilities'
import { Amount } from '@pooltogether/hooks'

import { Promotion, Epoch } from '@interfaces/promotions'

export const useNextRewardIn = (promotion: Promotion) => {
  const now = msToS(Date.now())

  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp

  const value = sToD(nextEpochEndTime - now)

  return { value, unit: 'days' }
}

interface EstimateRow {
  epoch: Epoch
  estimateAmount: number
}

// Tacks on the user's estimated amount per remaining epoch to the list of remaining epochs
// and returns that array
export const useEstimateRows = (
  promotion: Promotion,
  estimateAmount: Amount
): Array<EstimateRow> => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return []
  }

  const estimate = estimateAmount?.amount ? Number(estimateAmount?.amount) : 0
  const estimatePerEpoch = estimate / promotion.remainingEpochs

  return useMemo(() => {
    const estimateRows: Array<EstimateRow> = remainingEpochsArray.map((epoch) => ({
      epoch,
      estimateAmount: estimatePerEpoch
    }))

    return estimateRows
  }, [estimatePerEpoch, remainingEpochsArray])
}

export const useRemainingEpochsArrays = (promotion: Promotion) => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return []
  }

  return remainingEpochsArray
}

export const useLastEpochEndTime = (remainingEpochsArray: Array<Epoch>) => {
  return remainingEpochsArray?.[remainingEpochsArray.length - 1]?.epochEndTimestamp
}

export const usePromotionDaysRemaining = (promotion: Promotion) => {
  const remainingEpochsArray = useRemainingEpochsArrays(promotion)
  const lastEpochEndTime = useLastEpochEndTime(remainingEpochsArray)

  const now = msToS(Date.now())
  return sToD(lastEpochEndTime) - sToD(now)
}
