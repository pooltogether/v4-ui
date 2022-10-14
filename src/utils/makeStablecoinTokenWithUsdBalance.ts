import { Token, TokenWithUsdBalance } from '@pooltogether/hooks'
import { getAmount, getAmountFromUnformatted, toScaledUsdBigNumber } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'

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
  const amount = getAmountFromUnformatted(amountUnformatted, token.decimals)
  const usdPerToken = 1
  const balanceUsd = getAmount(amount.amount, '2')
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
