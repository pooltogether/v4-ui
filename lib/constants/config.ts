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

export const SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.polygon, CHAIN_ID.mainnet],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.mumbai, CHAIN_ID.rinkeby, CHAIN_ID.fuji]
})

export const DEFAULT_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

/**
 * Ethereum
 * Mainnet - mainnet
 * Testnet - rinkeby
 */
export const ETHEREUM_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.mainnet,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

/**
 * Polygon
 * Mainnet - polygon
 * Testnet - mumbai
 */
export const POLYGON_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

/**
 * Polygon
 * Mainnet - avalanche
 * Testnet - fuji
 */
export const AVALANCHE_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.avalanche,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.fuji
})

export const getEnvironmentChainIds = (appEnv: string) => {
  return {
    [Network.ethereum]: ETHEREUM_CHAIN_IDS[appEnv],
    [Network.polygon]: POLYGON_CHAIN_IDS[appEnv],
    [Network.avalanche]: AVALANCHE_CHAIN_IDS[appEnv]
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
  [CHAIN_ID.avalanche]: (tokenAddress: string) => `https://traderjoexyz.com/#/trade`,
  [CHAIN_ID.fuji]: (tokenAddress: string) => `https://traderjoexyz.com/#/trade`
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
    [CHAIN_ID.rinkeby]: '0x7188e2dd80B6eC7e01449b691fF9D86Ec7353ffF',
    [CHAIN_ID.mumbai]: '0x3Dc242154a73b422a5e976ec3568CD1753Ca45BE',
    [CHAIN_ID.fuji]: '0x0864B73B0619a3295694d0E8D4B490a7e6b808D8'
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
    [CHAIN_ID.rinkeby]: '0xfbd13cB1ab2feCc763510cC24bB0CE90e85eFAf6',
    [CHAIN_ID.mumbai]: '0x6ed4Edb336053C80bBFF9F17A68d8081587A37a0',
    [CHAIN_ID.fuji]: '0xF2c2d31C95cAcdc9D69B344C29d8E6cdF14153C3'
  }
})
