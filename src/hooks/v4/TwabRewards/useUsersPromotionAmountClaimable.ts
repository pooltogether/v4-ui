import { useQuery } from 'react-query'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useCoingeckoTokenPrices } from '@pooltogether/hooks'

interface TokenData {
  address: string
  decimals: number
}

interface UsersPromotionData {
  rewardsAmount: string
}

/**
 * Get the amount claimable for a promotion for a user
 */
export const useUsersPromotionAmountClaimable = (
  chainId: number,
  promotionId: number,
  usersPromotionData: UsersPromotionData,
  tokenData: TokenData
) => {
  const { address } = tokenData
  const usersAddress = useUsersAddress()

  const { data: tokenPrices, isFetched } = useCoingeckoTokenPrices(chainId, [address])

  return useQuery(
    getUsersPromotionAmountClaimableKey(chainId, promotionId, usersAddress),
    async () => getUsersPromotionAmountClaimable(tokenPrices, usersPromotionData, tokenData),
    {
      enabled: Boolean(usersPromotionData) && Boolean(tokenData) && isFetched
    }
  )
}

const getUsersPromotionAmountClaimableKey = (
  chainId: number,
  promotionId: number,
  usersAddress: string
) => ['getUsersPromotionAmountClaimable', chainId, promotionId, usersAddress]

export const getUsersPromotionAmountClaimable = async (
  tokenPrices: object,
  usersPromotionData: UsersPromotionData,
  tokenData: TokenData
) => {
  const { decimals, address } = tokenData

  let claimableUnformatted = BigNumber.from(0)

  usersPromotionData.rewardsAmount.split(',').forEach((numString) => {
    const amountUnformatted = BigNumber.from(numString)
    claimableUnformatted = claimableUnformatted.add(amountUnformatted)
  })

  let claimableUsd
  if (tokenPrices?.[address]) {
    claimableUsd = Number(formatUnits(claimableUnformatted, decimals)) * tokenPrices[address].usd
  }

  return { claimableUnformatted, claimableUsd }
}
