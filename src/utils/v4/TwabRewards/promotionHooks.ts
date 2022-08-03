import { sToD, msToS } from '@pooltogether/utilities'
import { Amount } from '@pooltogether/hooks'

import { Promotion, Epoch } from '@interfaces/promotions'

export const getNextRewardIn = (promotion: Promotion) => {
  const now = msToS(Date.now())

  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp

  const value = sToD(nextEpochEndTime - now)

  return { value, unit: 'days' }
}

export const getRemainingEpochsArrays = (promotion: Promotion) => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return []
  }

  return remainingEpochsArray
}

export const getLastEpochEndTime = (remainingEpochsArray: Array<Epoch>) => {
  return remainingEpochsArray?.[remainingEpochsArray.length - 1]?.epochEndTimestamp
}

export const getPromotionDaysRemaining = (promotion: Promotion) => {
  const remainingEpochsArray = getRemainingEpochsArrays(promotion)
  const lastEpochEndTime = getLastEpochEndTime(remainingEpochsArray)

  const now = msToS(Date.now())
  return sToD(lastEpochEndTime) - sToD(now)
}

export const getUsersCurrentEpochEstimateAccrued = (
  promotion: Promotion,
  estimateAmount: Amount
) => {
  const estimatePerEpoch = Number(estimateAmount?.amount) / promotion.numberOfEpochs

  const currentEpoch = promotion.epochCollection.remainingEpochsArray?.[0]

  let currentEpochEstimateAccrued
  if (currentEpoch) {
    const epochSecondsRemaining = currentEpoch?.epochEndTimestamp - msToS(Date.now())
    const epochElapsedPercent = 1 - epochSecondsRemaining / promotion.epochDuration

    currentEpochEstimateAccrued = estimatePerEpoch * epochElapsedPercent
  }

  return currentEpochEstimateAccrued
}
