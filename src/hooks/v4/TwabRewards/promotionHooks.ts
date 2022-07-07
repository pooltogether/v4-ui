import { useMemo } from 'react'
import { sToD, msToS } from '@pooltogether/utilities'

export const useNextRewardIn = (promotion) => {
  const now = msToS(Date.now())

  const remainingEpochsArray = promotion.epochs.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp

  const value = sToD(nextEpochEndTime - now)

  return { value, unit: 'days' }
}

// Tacks on the user's estimated amount per remaining epoch to the list of remaining epochs
// and returns just that array
export const useEstimateRows = (promotion, estimateAmount) => {
  const remainingEpochsArray = promotion.epochs.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return []
  }

  const estimatePerEpoch = Number(estimateAmount?.amount) / promotion.remainingEpochs

  return useMemo(() => {
    const estimateRows = remainingEpochsArray.map((epoch) => ({
      ...epoch,
      estimateAmount: estimatePerEpoch
    }))

    const estimateRowsReversed = [...estimateRows.reverse()]

    return { estimateRows, estimateRowsReversed }
  }, [estimatePerEpoch, remainingEpochsArray])
}

// Tacks on the user's estimated amount per remaining epoch to the list of remaining epochs
// and returns just that array
export const useRemainingEpochsArrays = (promotion) => {
  const remainingEpochsArray = promotion.epochs.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return { remainingEpochsArray: [], remainingEpochsArrayReversed: [] }
  }

  const remainingEpochsArrayReversed = [...remainingEpochsArray.reverse()]
  return { remainingEpochsArray, remainingEpochsArrayReversed }
}

export const useLastEpochEndTime = (remainingEpochsArray) => {
  return remainingEpochsArray?.[remainingEpochsArray.length - 1]?.epochEndTimestamp
}

export const usePromotionDaysRemaining = (promotion) => {
  const { remainingEpochsArray } = useRemainingEpochsArrays(promotion)
  const lastEpochEndTime = useLastEpochEndTime(remainingEpochsArray)

  const now = msToS(Date.now())
  return sToD(lastEpochEndTime) - sToD(now)
}
