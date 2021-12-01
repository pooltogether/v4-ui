import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

/////////////////////////////////////////////////////////////////////
// Constants pertaining to the networks and Prize Pools available in the app.
// When adding a new Prize Pool (or network) to the app, update all of these constants.
/////////////////////////////////////////////////////////////////////

/**
 * "Network" meaning:
 *    Ethereum - mainnet, rinkeby, goerli, etc
 *    Polygon - matic, mumbai
 *    etc.
 */
export enum Network {
  ethereum = 'ethereum',
  polygon = 'polygon',
  avalanche = 'avalanche'
}

export const SUPPORTED_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.polygon, CHAIN_ID.mainnet],
  // [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.mumbai, CHAIN_ID.rinkeby, CHAIN_ID.fuji]
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.mumbai, CHAIN_ID.rinkeby]
})

export const DEFAULT_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

/**
 * Ethereum
 * Mainnet - mainnet
 * Testnet - rinkeby
 */
export const ETHEREUM_NETWORK = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.mainnet,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

/**
 * Polygon
 * Mainnet - polygon
 * Testnet - mumbai
 */
export const POLYGON_NETWORK = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

/**
 * Polygon
 * Mainnet - avalanche
 * Testnet - fuji
 */
export const AVALANCHE_NETWORK = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.avalanche,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.fuji
})

export const getEnvironmentNetworks = (appEnv: string) => {
  return {
    [Network.ethereum]: ETHEREUM_NETWORK[appEnv],
    [Network.polygon]: POLYGON_NETWORK[appEnv]
    // [Network.avalanche]: AVALANCHE_NETWORK[appEnv]
  }
}

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
  ]
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
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`
})

/**
 * Prize Distributors to display in app
 */
export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe',
    [CHAIN_ID.polygon]: '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: '0xf49df4D05d9C99160777b79AdE9aA9222b202eAA',
    [CHAIN_ID.mumbai]: '0x8F3D72C660cE938FA2A5138a5EDb6496C81fADcC'
    // [CHAIN_ID.fuji]: '0xb29f3A6FD902A2b8971897e92D64C12105492E5E'
  }
})

/**
 * Prize Pools to display in app
 */
export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be',
    [CHAIN_ID.polygon]: '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: '0x996b69422d473a9B48e4A6C980328365B45847Ca',
    [CHAIN_ID.mumbai]: '0xF5165834Fc6ecbBFe6c4317673D6eF2C2d905BcB'
    // [CHAIN_ID.fuji]: '0x21CCBF996eD8f9306064bdc3Da553751e27650c0'
  }
})
