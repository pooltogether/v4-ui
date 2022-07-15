import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { sToD, msToS } from '@pooltogether/utilities'
import { Amount } from '@pooltogether/hooks'
import { useCoingeckoTokenPrices, TokenPrice } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'

import { Promotion, Epoch } from '@interfaces/promotions'
import { useUsersChainTwabPercentage } from '@hooks/v4/TwabRewards/useUsersChainTwabPercentage'

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

interface EstimateRowCollection {
  estimateRows: Array<EstimateRow>
  estimateRowsReversed: Array<EstimateRow>
}

// Tacks on the user's estimated amount per remaining epoch to the list of remaining epochs
// and returns that array
export const useEstimateRows = (
  promotion: Promotion,
  estimateAmount: Amount
): EstimateRowCollection => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return { estimateRows: [], estimateRowsReversed: [] }
  }

  const estimate = estimateAmount?.amount ? Number(estimateAmount?.amount) : 0
  const estimatePerEpoch = estimate / promotion.remainingEpochs

  return useMemo(() => {
    const estimateRows: Array<EstimateRow> = remainingEpochsArray.map((epoch) => ({
      epoch,
      estimateAmount: estimatePerEpoch
    }))

    const estimateRowsReversed = [...estimateRows.reverse()]

    return { estimateRows, estimateRowsReversed }
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

// Calculate the variable annual percentage rate for a promotion
export const usePromotionVAPR = (promotion: Promotion, decimals: number): number => {
  console.log(promotion)

  // http://rinkeby.etherscan.com/address/0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A
  // const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(
  //   promotion.chainId,
  //   [promotion.token]
  // )
  const tokenPrices = {
    '0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A': { usd: 0.76 },
    '0xc4e90a8dc6caab329f08ed3c8abc6b197cf0f40a': { usd: 0.76 }
  }

  const usersAddress = useUsersAddress()

  const { data: usersChainTwabPercentage, isFetched: percentageIsFetched } =
    useUsersChainTwabPercentage(promotion.chainId, usersAddress)
  return useMemo(() => {
    const daysRemaining = usePromotionDaysRemaining(promotion)
    let vapr: number = 0
    if (daysRemaining > 0) {
      const usd = tokenPrices[promotion.token].usd

      const daysPerEpoch = sToD(promotion.epochDuration)
      // rewards token! OP, POOl, etc. Use rewards token decimals and USD value!
      const tokensPerDay = Number(formatUnits(promotion.tokensPerEpoch, decimals)) / daysPerEpoch
      const valuePerDay = tokensPerDay * usd

      // deposit token! typically USDC, use deposit token decimals and USD value!
      const STABLECOIN_USD = 1.01
      const TOTAL_CHAIN_DEPOSITS = '2000000000000000000000000'
      const totalValue = Number(formatUnits(TOTAL_CHAIN_DEPOSITS, decimals)) * STABLECOIN_USD

      vapr = (valuePerDay / totalValue) * 365 * 100
    }

    return vapr
  }, [promotion, tokenPrices])
}
