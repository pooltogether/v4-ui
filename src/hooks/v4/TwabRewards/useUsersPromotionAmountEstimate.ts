import { useQuery } from 'react-query'
import { formatUnits } from '@ethersproject/units'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useCoingeckoTokenPrices } from '@pooltogether/hooks'

import { useUsersChainTwabPercentage } from '@hooks/v4/TwabRewards/useUsersChainTwabPercentage'

interface TokenData {
  address: string
  decimals: number
}

interface Promotion {
  id: number
  tokensPerEpoch: string
  remainingEpochs: number
}

/**
 * Get the amount Estimate for a promotion for a user
 */
export const useUsersPromotionAmountEstimate = (
  chainId: number,
  promotion: Promotion,
  tokenData: TokenData
) => {
  const { address } = tokenData
  const { id: promotionId } = promotion
  const usersAddress = useUsersAddress()

  const { data: usersChainTwabPercentage, isFetched: percentageIsFetched } =
    useUsersChainTwabPercentage(chainId, usersAddress)

  const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(chainId, [
    address
  ])

  const isFetched = percentageIsFetched && tokenPricesIsFetched

  return useQuery(
    getUsersPromotionAmountEstimateKey(chainId, promotionId, usersAddress),
    async () =>
      getUsersPromotionAmountEstimate(tokenPrices, tokenData, promotion, usersChainTwabPercentage),
    {
      enabled: Boolean(tokenData) && isFetched
    }
  )
}

const getUsersPromotionAmountEstimateKey = (
  chainId: number,
  promotionId: number,
  usersAddress: string
) => ['getUsersPromotionAmountEstimate', chainId, promotionId, usersAddress]

export const getUsersPromotionAmountEstimate = async (
  tokenPrices: any,
  tokenData: TokenData,
  promotion: Promotion,
  usersChainTwabPercentage: number
) => {
  const { decimals } = tokenData

  const { tokensPerEpoch, remainingEpochs } = promotion

  const tokensPerEpochFormatted = formatUnits(tokensPerEpoch, decimals)

  const estimate = usersChainTwabPercentage * parseFloat(tokensPerEpochFormatted) * remainingEpochs

  // TODO: Proper USD conversions
  const estimateUsd = 4124089789

  return { estimate, estimateUsd }
}
