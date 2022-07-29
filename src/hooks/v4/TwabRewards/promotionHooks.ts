import { sToD, msToS } from '@pooltogether/utilities'
import { Amount } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { PrizePool } from '@pooltogether/v4-client-js'

import { Promotion, Epoch } from '@interfaces/promotions'
import { useUsersPrizePoolTwabAtTimestamp } from '@hooks/v4/PrizePool/useUsersPrizePoolTwabAtTimestamp'

export const useNextRewardIn = (promotion: Promotion) => {
  const now = msToS(Date.now())

  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp

  const value = sToD(nextEpochEndTime - now)

  return { value, unit: 'days' }
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

export const useUsersCurrentEpochEstimateAccrued = (
  prizePool: PrizePool,
  promotion: Promotion,
  estimateAmount: Amount
) => {
  // const estimatePerEpoch = Number(estimateAmount?.amount) / promotion.numberOfEpochs

  const usersAddress = useUsersAddress()
  const currentEpoch = promotion.epochCollection.remainingEpochsArray?.[0]
  const epochStartTimestamp = currentEpoch?.epochStartTimestamp

  const { data: twabData, isFetched: isTwabDataFetched } = useUsersPrizePoolTwabAtTimestamp(
    usersAddress,
    prizePool,
    epochStartTimestamp
  )
  console.log({ twabData })

  let currentEpochEstimateAccrued
  if (currentEpoch) {
    const epochSecondsRemaining = currentEpoch?.epochEndTimestamp - msToS(Date.now())
    const epochElapsedPercent = 1 - epochSecondsRemaining / promotion.epochDuration

    currentEpochEstimateAccrued = estimatePerEpoch * epochElapsedPercent
  }

  return currentEpochEstimateAccrued
}
