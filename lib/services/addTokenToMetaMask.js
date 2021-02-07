import { CONTRACT_ADDRESSES } from 'lib/constants'

export const addTokenToMetaMask = async (chainId) => {
  const poolTokenAddress = CONTRACT_ADDRESSES[chainId].PoolToken

  try {
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: poolTokenAddress,
          symbol: 'POOL', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
          image: 'https://app.pooltogether.com/pooltogether-token-logo@2x.png',
        },
      },
    })

    if (wasAdded) {
      // console.log('Thanks for your interest!')
    } else {
      console.log('Token not added')
    }
  } catch (error) {
    console.log(error)
  }
}
