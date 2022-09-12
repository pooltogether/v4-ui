import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { Chain } from 'wagmi'
import { CHAIN_ID, getChain } from '@pooltogether/wallet-connection'

/////////////////////////////////////////////////////////////////////
// Constants pertaining to the networks and Prize Pools available in the app.
// When adding a new Prize Pool (or network) to the app, update all of these constants.
/////////////////////////////////////////////////////////////////////

export const RPC_API_KEYS = {
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
}

// NOTE: Should be empty. Add a chain id to hide it in app.
export const CHAIN_IDS_TO_BLOCK = Object.freeze([])

export const V4_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(new Set(mainnet.contracts.map((c) => c.chainId))).filter(
    (chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(new Set(testnet.contracts.map((c) => c.chainId))).filter(
    (chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)
  )
})

// TODO: Link this to the v3 constants
export const V3_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [
    CHAIN_ID.mainnet,
    CHAIN_ID.bsc,
    CHAIN_ID.polygon,
    CHAIN_ID.celo
  ].filter((chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)),
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.goerli, CHAIN_ID.mumbai].filter(
    (chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)
  )
})

// TODO: Filter here
export const SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(
    new Set([
      ...V3_CHAIN_IDS[APP_ENVIRONMENTS.mainnets],
      ...V4_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
    ])
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(
    new Set([
      ...V3_CHAIN_IDS[APP_ENVIRONMENTS.testnets],
      ...V4_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    ])
  )
})

export const SUPPORTED_CHAIN_NAMES = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(
    getNetworkNameAliasByChainId
  ),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(
    getNetworkNameAliasByChainId
  )
})

export const SUPPORTED_CHAINS: { [key: string]: Chain[] } = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(getChain),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(getChain)
})

export const DEFAULT_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.optimism,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID['optimism-goerli']
})

// Native currency symbols in app
export const CHAIN_NATIVE_CURRENCY = Object.freeze({
  [CHAIN_ID.optimism]: 'Ξ',
  [CHAIN_ID.matic]: 'MATIC',
  [CHAIN_ID.mainnet]: 'Ξ',
  [CHAIN_ID.avalanche]: 'AVAX',
  [CHAIN_ID['optimism-goerli']]: 'Ξ',
  [CHAIN_ID.mumbai]: 'MATIC',
  [CHAIN_ID.goerli]: 'Ξ',
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
  [CHAIN_ID.goerli]: [
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
  [CHAIN_ID.fuji]: [{ url: 'https://bridge.avax.network/', title: 'Avalanche bridge' }],
  [CHAIN_ID.optimism]: [{ url: 'https://app.optimism.io/bridge', title: 'Optimism bridge' }],
  [CHAIN_ID['optimism-goerli']]: [
    { url: 'https://app.optimism.io/bridge', title: 'Optimism bridge' }
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
    `https://app.uniswap.org/#/swap?chain=mainnet&theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.optimism]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?chain=optimism&theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.goerli]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?chain=goerli&theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.polygon]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?chain=polygon&theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.mumbai]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?chain=mumbai&theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.avalanche]: (tokenAddress: string) =>
    `https://traderjoexyz.com/#/trade?outputCurrency=${tokenAddress}`,
  [CHAIN_ID.fuji]: (tokenAddress: string) => `https://traderjoexyz.com/#/trade`
})

/**
 * Coinbase Keys for Coinbase Pay
 */
export const getCoinbaseChainKey = (chainId: number) => COINBASE_CHAIN_KEYS[chainId]
export const COINBASE_CHAIN_KEYS = Object.freeze({
  [CHAIN_ID.mainnet]: 'ethereum',
  [CHAIN_ID.avalanche]: 'avalanche-c-chain',
  // [CHAIN_ID.optimism]: 'optimism',
  [CHAIN_ID.polygon]: 'polygon'
})
export const getCoinbaseChainAssets = (chainId: number) => COINBASE_ASSETS[chainId]
export const COINBASE_ASSETS = Object.freeze({
  [CHAIN_ID.mainnet]: ['ETH', 'USDC'],
  [CHAIN_ID.avalanche]: ['AVAX'],
  [CHAIN_ID.polygon]: ['USDC', 'MATIC'],
  [CHAIN_ID.optimism]: ['USDC', 'ETH']
})
