import { sToD, msToS } from '@pooltogether/utilities'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { PrizePool } from '@pooltogether/v4-client-js'
import { formatUnits } from '@ethersproject/units'
import { useToken } from '@pooltogether/hooks'

import { Promotion, Epoch } from '@interfaces/promotions'
import { useUsersPrizePoolTwabBetween } from '@hooks/v4/PrizePool/useUsersPrizePoolTwabBetween'
import { useChainPrizePoolTicketTotalSupply } from '@hooks/v4/PrizePool/useChainPrizePoolTicketTotalSupply'

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

export const useUsersCurrentEpochEstimateAccrued = (prizePool: PrizePool, promotion: Promotion) => {
  const { prizePoolTotalSupply: totalTwabSupply, decimals: depositTokenDecimals } =
    useChainPrizePoolTicketTotalSupply(prizePool.chainId)

  const { data: token, isFetched: tokenIsFetched } = useToken(prizePool.chainId, promotion.token)

  const usersAddress = useUsersAddress()
  const currentEpoch = promotion.epochCollection.remainingEpochsArray?.[0]
  const epochStartTimestamp = currentEpoch?.epochStartTimestamp
  const now = Math.round(msToS(Date.now()))
  const { data: twabData, isFetched: isTwabDataFetched } = useUsersPrizePoolTwabBetween(
    usersAddress,
    prizePool,
    epochStartTimestamp,
    now
  )

  let currentEpochAccrued
  if (currentEpoch && isTwabDataFetched && tokenIsFetched) {
    const users = formatUnits(twabData.twab.amountUnformatted, depositTokenDecimals)
    const total = formatUnits(totalTwabSupply, depositTokenDecimals)

    const usersChainTwabPercentage = parseFloat(users) / parseFloat(total)

    const epochSecondsRemaining = currentEpoch?.epochEndTimestamp - msToS(Date.now())
    const epochElapsedPercent = 1 - epochSecondsRemaining / promotion.epochDuration

    const tokensPerEpochFormatted = formatUnits(promotion.tokensPerEpoch, token.decimals)

    const currentEpochTotalEstimate = usersChainTwabPercentage * parseFloat(tokensPerEpochFormatted)

    currentEpochAccrued = epochElapsedPercent * currentEpochTotalEstimate
  }

  return currentEpochAccrued
}
