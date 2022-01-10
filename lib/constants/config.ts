import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

/////////////////////////////////////////////////////////////////////
// Constants pertaining to the networks and Prize Pools available in the app.
// When adding a new Prize Pool (or network) to the app, update all of these constants.
/////////////////////////////////////////////////////////////////////

export const SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(new Set(mainnet.contracts.map((c) => c.chainId))),
  [APP_ENVIRONMENTS.testnets]: Array.from(new Set(testnet.contracts.map((c) => c.chainId)))
})

export const SUPPORTED_CHAIN_NAMES = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(
    getNetworkNameAliasByChainId
  ),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(
    getNetworkNameAliasByChainId
  )
})

export const DEFAULT_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

// Native currency symbols in app
export const CHAIN_NATIVE_CURRENCY = Object.freeze({
  [CHAIN_ID.mainnet]: 'Ξ',
  [CHAIN_ID.rinkeby]: 'Ξ',
  [CHAIN_ID.matic]: 'MATIC',
  [CHAIN_ID.mumbai]: 'MATIC',
  [CHAIN_ID.avalanche]: 'AVAX',
  [CHAIN_ID.fuji]: 'AVAX'
})

/**
 * Urls used for quick links to bridges for users
 */
export const getBridgeUrls = (chainId: number) =>
  BRIDGE_URLS[chainId] || BRIDGE_URLS[CHAIN_ID.mainnet]
const BRIDGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.rinkeby]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.mumbai]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.polygon]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.avalanche]: [{ url: 'https://bridge.avax.network/', title: 'Avalanche bridge' }],
  [CHAIN_ID.fuji]: [{ url: 'https://bridge.avax.network/', title: 'Avalanche bridge' }]
})

/**
 * Urls used to display a DEX in an iFrame
 * @param chainId
 * @param tokenAddress
 * @returns
 */
export const getExchangeUrl = (chainId: number, tokenAddress: string) =>
  EXCHANGE_URLS[chainId]?.(tokenAddress) || EXCHANGE_URLS[CHAIN_ID.mainnet](tokenAddress)
const EXCHANGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.rinkeby]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.polygon]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.mumbai]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.avalanche]: (tokenAddress: string) =>
    `https://traderjoexyz.com/#/trade?outputCurrency=${tokenAddress}`,
  [CHAIN_ID.fuji]: (tokenAddress: string) => `https://traderjoexyz.com/#/trade`
})
