import { poolToast } from '@pooltogether/react-components'

import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'

export const addTokenToMetaMask = async (
  t,
  symbol,
  tokenAddress,
  decimals = DEFAULT_TOKEN_PRECISION
) => {
  try {
    symbol = symbol.replace('-', '').substr(0, 5)

    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals, // The number of decimals in the token
          image: 'https://app.pooltogether.com/pooltogether-token-logo@2x.png'
        }
      }
    })

    if (wasAdded) {
      poolToast.success(t('successfullyAddedTokenToMetaMask', { token: symbol }))
    }
  } catch (error) {
    console.error(error)
  }
}
