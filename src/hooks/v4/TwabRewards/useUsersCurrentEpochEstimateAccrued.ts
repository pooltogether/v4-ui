import { Promotion } from '@interfaces/promotions'
import { useToken } from '@pooltogether/hooks'
import { msToS } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'

import { useChainPrizePoolTicketTotalSupply } from '../PrizePool/useChainPrizePoolTicketTotalSupply'
import { useUsersPrizePoolTwabBetween } from '../PrizePool/useUsersPrizePoolTwabBetween'

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

  return useMemo(() => {
    if (!currentEpoch || !isTwabDataFetched || !tokenIsFetched || !totalTwabSupply) {
      return undefined
    }
    const users = formatUnits(twabData.twab.amountUnformatted, depositTokenDecimals)
    const total = formatUnits(totalTwabSupply.amountUnformatted, depositTokenDecimals)

    const usersChainTwabPercentage = parseFloat(users) / parseFloat(total)

    const epochSecondsRemaining = currentEpoch?.epochEndTimestamp - msToS(Date.now())
    const epochElapsedPercent = 1 - epochSecondsRemaining / promotion.epochDuration

    const tokensPerEpochFormatted = formatUnits(promotion.tokensPerEpoch, token.decimals)

    const currentEpochTotalEstimate = usersChainTwabPercentage * parseFloat(tokensPerEpochFormatted)

    return epochElapsedPercent * currentEpochTotalEstimate
  }, [currentEpoch, isTwabDataFetched, tokenIsFetched, totalTwabSupply])
}
