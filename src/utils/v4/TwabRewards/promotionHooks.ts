import { Promotion, Epoch } from '@interfaces/promotions'
import { sToD, msToS } from '@pooltogether/utilities'

export const getNextRewardIn = (promotion: Promotion) => {
  const now = msToS(Date.now())
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp
  const seconds = nextEpochEndTime - now
  const value = sToD(seconds)
  return { value, unit: 'days', seconds }
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
