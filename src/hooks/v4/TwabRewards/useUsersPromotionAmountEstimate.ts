import { useQuery } from 'react-query'
import { formatUnits } from '@ethersproject/units'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { TokenWithAllBalances, useCoingeckoTokenPrices, TokenPrice } from '@pooltogether/hooks'

import { useUsersChainTwabPercentage } from '@hooks/v4/TwabRewards/useUsersChainTwabPercentage'
import { getAmountFromString } from '@utils/getAmountFromString'

interface Promotion {
  id: number
  tokensPerEpoch: string
  remainingEpochs: number
}

/**
 * Get the estimated amount a user will receive for an entire promotion
 */
export const useUsersPromotionAmountEstimate = (
  chainId: number,
  promotion: Promotion,
  token: TokenWithAllBalances
) => {
  const { address } = token || {}
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
      getUsersPromotionAmountEstimate(tokenPrices, token, promotion, usersChainTwabPercentage),
    {
      enabled: Boolean(token) && isFetched
    }
  )
}

const getUsersPromotionAmountEstimateKey = (
  chainId: number,
  promotionId: number,
  usersAddress: string
) => ['getUsersPromotionAmountEstimate', chainId, promotionId, usersAddress]

export const getUsersPromotionAmountEstimate = async (
  tokenPrices: {
    [address: string]: TokenPrice
  },
  token: TokenWithAllBalances,
  promotion: Promotion,
  usersChainTwabPercentage: number
) => {
  const { address, decimals } = token

  const { tokensPerEpoch, remainingEpochs } = promotion

  const tokensPerEpochFormatted = formatUnits(tokensPerEpoch, decimals)

  const estimate = usersChainTwabPercentage * parseFloat(tokensPerEpochFormatted) * remainingEpochs

  const amount = getAmountFromString(estimate.toString(), decimals)

  let usd
  if (tokenPrices?.[address]) {
    usd = Number(amount.amount) * tokenPrices[address].usd
  }

  return { amount, usd }
}
