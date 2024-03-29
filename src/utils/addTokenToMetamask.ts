// @ts-nocheck
// Note: CoinbaseWalletSDK types window.ethereum but the type doesn't support wallet_watchAsset
const DEFAULT_TOKEN_PRECISION = 18

export const addTokenToMetamask = async (
  symbol: string,
  tokenAddress: string,
  decimals: number | string = DEFAULT_TOKEN_PRECISION,
  tokenImgUrl?: string
) => {
  try {
    symbol = symbol.replace('-', '').substr(0, 5)

    if (typeof window === 'undefined') return null

    const ethereum = window?.ethereum

    return await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: Number(decimals), // The number of decimals in the token
          image: tokenImgUrl
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
}
