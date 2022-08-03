import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { sToD } from '@pooltogether/utilities'
import { useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { useToken } from '@pooltogether/hooks'

import { Promotion } from '@interfaces/promotions'
import { useChainPrizePoolTicketTotalSupply } from '@hooks/v4/PrizePool/useChainPrizePoolTicketTotalSupply'
import { getPromotionDaysRemaining } from '@utils/v4/TwabRewards/promotionHooks'

// Calculate the variable annual percentage rate for a promotion
export const usePromotionVAPR = (promotion: Promotion): number => {
  const { token: promotionTokenAddress } = promotion

  const { prizePoolTotalSupply: totalTwabSupply, ticket: depositToken } =
    useChainPrizePoolTicketTotalSupply(promotion.chainId)

  const { data: promotionToken, isFetched: tokenIsFetched } = useToken(
    promotion.chainId,
    promotionTokenAddress
  )
  const { decimals: promotionTokenDecimals } = promotionToken || {}

  const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(
    promotion.chainId,
    [promotionTokenAddress, depositToken.address]
  )

  return useMemo(() => {
    const daysRemaining = getPromotionDaysRemaining(promotion)
    let vapr: number = 0

    const isReady =
      tokenPricesIsFetched && tokenIsFetched && totalTwabSupply && depositToken?.decimals

    if (daysRemaining > 0 && isReady && tokenPrices) {
      const promotionTokenUsd = tokenPrices[promotionTokenAddress].usd
      const depositTokenUsd = 1 // assume 1 ptaUSDC equals $1 here

      const valuePerDay = promotionTokenValuePerDay(
        promotion,
        promotionTokenUsd,
        promotionTokenDecimals
      )

      // Deposit token (typically USDC)
      // Use deposit token decimals and USD value
      const totalValue =
        Number(formatUnits(totalTwabSupply, depositToken.decimals)) * depositTokenUsd

      vapr = (valuePerDay / totalValue) * 365 * 100
    }

    return vapr
  }, [promotion, promotionToken, tokenPrices, totalTwabSupply])
}

// Rewards token (OP, POOL, etc.)
// Use rewards token decimals and USD value
const promotionTokenValuePerDay = (
  promotion: Promotion,
  promotionTokenUsd: number,
  decimals: string
) => {
  const daysPerEpoch = sToD(promotion.epochDuration)
  const tokensPerDay = Number(formatUnits(promotion.tokensPerEpoch, decimals)) / daysPerEpoch
  return tokensPerDay * promotionTokenUsd
}
