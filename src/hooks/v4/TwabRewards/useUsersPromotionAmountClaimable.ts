import { useQuery } from 'react-query'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { TokenWithAllBalances, useCoingeckoTokenPrices } from '@pooltogether/hooks'

import { getAmountFromString } from '@utils/getAmountFromString'

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
  token: TokenWithAllBalances
) => {
  const { address } = token || {}
  const usersAddress = useUsersAddress()

  const { data: tokenPrices, isFetched } = useCoingeckoTokenPrices(chainId, [address])

  return useQuery(
    getUsersPromotionAmountClaimableKey(chainId, promotionId, usersAddress),
    async () => getUsersPromotionAmountClaimable(tokenPrices, usersPromotionData, token),
    {
      enabled: Boolean(usersPromotionData) && Boolean(address) && isFetched
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
  token: TokenWithAllBalances
) => {
  const { decimals, address } = token

  let claimableUnformatted = BigNumber.from(0)

  usersPromotionData.rewardsAmount.split(',').forEach((numString) => {
    const amountUnformatted = BigNumber.from(numString)
    claimableUnformatted = claimableUnformatted.add(amountUnformatted)
  })

  const claimableFormatted = formatUnits(claimableUnformatted, decimals)
  const amount = getAmountFromString(claimableFormatted, decimals)

  let usd
  if (tokenPrices?.[address]) {
    usd = Number(claimableFormatted) * tokenPrices[address].usd
  }

  return { amount, usd }
}
