import { Token, TokenWithUsdBalance } from '@pooltogether/hooks'
import { toScaledUsdBigNumber } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from './getAmountFromBigNumber'
import { getAmountFromString } from './getAmountFromString'

/**
 * Formats a token and amount with a price of $1 USD.
 * @param amountUnformatted
 * @param token
 * @returns
 */
export const makeStablecoinTokenWithUsdBalance = (
  amountUnformatted: BigNumber,
  token: Token
): TokenWithUsdBalance => {
  const amount = getAmountFromBigNumber(amountUnformatted, token.decimals)
  const usdPerToken = 1
  const balanceUsd = getAmountFromString(amount.amount, '2')
  const balanceUsdScaled = toScaledUsdBigNumber(amount.amount)
  return {
    ...token,
    ...amount,
    hasBalance: !amount.amountUnformatted.isZero(),
    usdPerToken,
    balanceUsd,
    balanceUsdScaled
  }
}
