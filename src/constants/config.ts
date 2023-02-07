import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { ContractType } from '@pooltogether/v4-client-js'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { CHAIN_ID, getChain } from '@pooltogether/wallet-connection'
import { Chain } from 'wagmi'

/////////////////////////////////////////////////////////////////////
// Constants pertaining to the networks and Prize Pools available in the app.
// When adding a new Prize Pool (or network) to the app, update all of these constants.
/////////////////////////////////////////////////////////////////////

export const RPC_URLS = {
  // Ethereum
  [CHAIN_ID.mainnet]: process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_RPC_URL,
  [CHAIN_ID.rinkeby]: process.env.NEXT_PUBLIC_ETHEREUM_RINKEBY_RPC_URL,
  [CHAIN_ID.ropsten]: process.env.NEXT_PUBLIC_ETHEREUM_ROPSTEN_RPC_URL,
  [CHAIN_ID.kovan]: process.env.NEXT_PUBLIC_ETHEREUM_KOVAN_RPC_URL,
  [CHAIN_ID.goerli]: process.env.NEXT_PUBLIC_ETHEREUM_GOERLI_RPC_URL,
  // Avalanche
  [CHAIN_ID.avalanche]: process.env.NEXT_PUBLIC_AVALANCHE_MAINNET_RPC_URL,
  [CHAIN_ID.fuji]: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL,
  // Polygon
  [CHAIN_ID.polygon]: process.env.NEXT_PUBLIC_POLYGON_MAINNET_RPC_URL,
  [CHAIN_ID.mumbai]: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL,
  // Optimism
  [CHAIN_ID.optimism]: process.env.NEXT_PUBLIC_OPTIMISM_MAINNET_RPC_URL,
  [CHAIN_ID['optimism-goerli']]: process.env.NEXT_PUBLIC_OPTIMISM_GOERLI_RPC_URL,
  // Arbitrum
  [CHAIN_ID.arbitrum]: process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL,
  [CHAIN_ID['arbitrum-goerli']]: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_RPC_URL,
  // Celo
  [CHAIN_ID.celo]: process.env.NEXT_PUBLIC_CELO_MAINNET_RPC_URL,
  [CHAIN_ID['celo-testnet']]: process.env.NEXT_PUBLIC_CELO_TESTNET_RPC_URL
}

// NOTE: Should be empty. Add a chain id to hide it in app.
export const CHAIN_IDS_TO_BLOCK = Object.freeze([])

// Pull prize pool addresses from the contract list
export const V4_PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: mainnet.contracts.reduce<{ [chainId: number]: string[] }>(
    (prizePoolsByChainId, contract) => {
      if (contract.type === ContractType.YieldSourcePrizePool) {
        if (!prizePoolsByChainId[contract.chainId]) {
          prizePoolsByChainId[contract.chainId] = []
        }
        prizePoolsByChainId[contract.chainId].push(contract.address.toLowerCase())
      }
      return prizePoolsByChainId
    },
    {}
  ),
  [APP_ENVIRONMENTS.testnets]: testnet.contracts.reduce<{ [chainId: number]: string[] }>(
    (prizePoolsByChainId, contract) => {
      if (contract.type === ContractType.YieldSourcePrizePool) {
        if (!prizePoolsByChainId[contract.chainId]) {
          prizePoolsByChainId[contract.chainId] = []
        }
        prizePoolsByChainId[contract.chainId].push(contract.address.toLowerCase())
      }
      return prizePoolsByChainId
    },
    {}
  )
})

// Pull chain ids from the contract list
export const V4_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(new Set(mainnet.contracts.map((c) => c.chainId))).filter(
    (chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(new Set(testnet.contracts.map((c) => c.chainId))).filter(
    (chainId) => !CHAIN_IDS_TO_BLOCK.includes(chainId)
  )
})

// Set default addresses for all of the chain ids provided
export const DEFAULT_PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Object.freeze(
    V4_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].reduce<{ [chainId: number]: string }>(
      (defaultPrizePools, chainId) => {
        defaultPrizePools[chainId] = mainnet.contracts.find(
          (c) => chainId === c.chainId && c.type === ContractType.YieldSourcePrizePool
        ).address
        return defaultPrizePools
      },
      {} // Add overrides here and check if set above before setting the first address in the list
    )
  ),
  [APP_ENVIRONMENTS.testnets]: Object.freeze(
    V4_CHAIN_IDS[APP_ENVIRONMENTS.testnets].reduce<{ [chainId: number]: string }>(
      (defaultPrizePools, chainId) => {
        defaultPrizePools[chainId] = testnet.contracts.find(
          (c) => chainId === c.chainId && c.type === ContractType.YieldSourcePrizePool
        ).address
        return defaultPrizePools
      },
      {} // Add overrides here and check if set above before setting the first address in the list
    )
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
  [CHAIN_ID.arbitrum]: 'Ξ',
  [CHAIN_ID['arbitrum-goerli']]: 'Ξ',
  [CHAIN_ID.mumbai]: 'MATIC',
  [CHAIN_ID.goerli]: 'Ξ',
  [CHAIN_ID.fuji]: 'AVAX'
})

// These pools have EIP2612-compatible tokens and thus can have gasless approvals:
export const SUPPORTED_EIP2612_PRIZE_POOL_IDS: string[] = [
  // `0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be-${CHAIN_ID.mainnet}`,
  // `0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60-${CHAIN_ID.polygon}`,
  `0x7b36f452f13f897eC1CCBe660A64971B6095f666-${CHAIN_ID.goerli}`
]

/**
 * Urls used for quick links to onramps for users
 */
export const getOnRamps = (chainId: number) => ON_RAMP_URLS[chainId]
export const ON_RAMP_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: [
    {
      url: 'https://juno.finance/partners/PoolTogether?currency=usdc&action=buy&partnerKey=live_wPwq3D4YN2VKjl6U2z9W91b9',
      title: 'Juno'
    }
  ],
  [CHAIN_ID.optimism]: [
    {
      url: 'https://juno.finance/partners/PoolTogether?currency=usdc&action=buy&partnerKey=live_wPwq3D4YN2VKjl6U2z9W91b9&network=Optimism',
      title: 'Juno'
    }
  ],
  [CHAIN_ID.arbitrum]: [
    {
      url: 'https://juno.finance/partners/PoolTogether?currency=usdc&action=buy&partnerKey=live_wPwq3D4YN2VKjl6U2z9W91b9&network=Arbitrum%20One',
      title: 'Juno'
    }
  ]
})

/**
 * Urls used for quick links to bridges for users
 */
export const getBridges = (chainId: number) => BRIDGE_URLS[chainId] || BRIDGE_URLS[CHAIN_ID.mainnet]
export const BRIDGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: [
    { url: 'https://app.optimism.io/bridge', title: 'Optimism bridge' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://bridge.avax.network/', title: 'Avalanche bridge' },
    { url: 'https://bridge.arbitrum.io/', title: 'Arbitrum bridge' }
    // { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    // { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.polygon]: [
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' }
    // { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    // { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.avalanche]: [{ url: 'https://bridge.avax.network/', title: 'Avalanche bridge' }],
  [CHAIN_ID.optimism]: [{ url: 'https://app.optimism.io/bridge', title: 'Optimism bridge' }],
  [CHAIN_ID.arbitrum]: [{ url: 'https://bridge.arbitrum.io/', title: 'Arbitrum bridge' }]
})

/**
 * Urls used to display a DEX in an iFrame
 * @param chainId
 * @param tokenAddress
 * @returns
 */
export const getExchange = (chainId: number, tokenAddress?: string) =>
  EXCHANGE_URLS[chainId]?.(tokenAddress) || EXCHANGE_URLS[CHAIN_ID.mainnet](tokenAddress)

export const EXCHANGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: (tokenAddress?: string) => ({
    url: `https://app.uniswap.org/#/swap?chain=mainnet&theme=dark${
      !!tokenAddress ? `&outputCurrency=${tokenAddress}` : ''
    }`,
    title: 'Uniswap'
  }),
  [CHAIN_ID.optimism]: (tokenAddress?: string) => ({
    url: `https://app.uniswap.org/#/swap?chain=optimism&theme=dark${
      !!tokenAddress ? `&outputCurrency=${tokenAddress}` : ''
    }`,
    title: 'Uniswap'
  }),

  [CHAIN_ID.polygon]: (tokenAddress?: string) => ({
    url: `https://app.uniswap.org/#/swap?chain=polygon&theme=dark${
      !!tokenAddress ? `&outputCurrency=${tokenAddress}` : ''
    }`,
    title: 'Uniswap'
  }),

  [CHAIN_ID.avalanche]: (tokenAddress?: string) => ({
    url: `https://traderjoexyz.com/#/trade?${
      !!tokenAddress ? `&outputCurrency=${tokenAddress}` : ''
    }`,
    title: 'Trader Joe'
  }),
  [CHAIN_ID.arbitrum]: (tokenAddress?: string) => ({
    url: `https://app.uniswap.org/#/swap?chain=arbitrum&theme=dark${
      !!tokenAddress ? `&outputCurrency=${tokenAddress}` : ''
    }`,
    title: 'Uniswap'
  })
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

/**
 * Subgraphs to query for prizes claimed
 */
export const PRIZES_CLAIMED_SUBGRAPH_URIS = {
  [CHAIN_ID.optimism]: `https://api.thegraph.com/subgraphs/name/pooltogether/optimism-v4-prizes-claimed`,
  // [CHAIN_ID.arbitrum]: `https://api.thegraph.com/subgraphs/name/pooltogether/arbitrum-v4-prizes-claimed`,
  [CHAIN_ID.mainnet]: `https://api.thegraph.com/subgraphs/name/pooltogether/mainnet-v4-prizes-claimed`,
  [CHAIN_ID.polygon]: `https://api.thegraph.com/subgraphs/name/pooltogether/polygon-v4-prizes-claimed`,
  [CHAIN_ID.avalanche]: `https://api.thegraph.com/subgraphs/name/pooltogether/avalanche-v4-prizes-claimed`,
  [CHAIN_ID.goerli]: `https://api.thegraph.com/subgraphs/name/pooltogether/goerli-v4-prizes-claimed`,
  [CHAIN_ID.mumbai]: `https://api.thegraph.com/subgraphs/name/pooltogether/mumbai-v4-prizes-claimed`,
  [CHAIN_ID.fuji]: `https://api.thegraph.com/subgraphs/name/pooltogether/fuji-v4-prizes-claimed`,
  [CHAIN_ID[
    'optimism-goerli'
  ]]: `https://api.thegraph.com/subgraphs/name/pooltogether/op-goerli-v4-prizes-claimed`,
  [CHAIN_ID[
    'arbitrum-goerli'
  ]]: `https://api.thegraph.com/subgraphs/name/pooltogether/arb-goerli-v4-prizes-claimed`
}

export const TWAB_REWARDS_SUBGRAPH_URIS = {
  [CHAIN_ID.optimism]: `https://api.thegraph.com/subgraphs/name/pooltogether/optimism-twab-rewards`,
  [CHAIN_ID.mainnet]: `https://api.thegraph.com/subgraphs/name/pooltogether/mainnet-twab-rewards`,
  [CHAIN_ID.polygon]: `https://api.thegraph.com/subgraphs/name/pooltogether/polygon-twab-rewards`,
  [CHAIN_ID.avalanche]: `https://api.thegraph.com/subgraphs/name/pooltogether/avalanche-twab-rewards`,
  [CHAIN_ID['optimism-goerli']]:
    'https://api.thegraph.com/subgraphs/name/pooltogether/optimism-goerli-twab-rewards',
  [CHAIN_ID.goerli]: 'https://api.thegraph.com/subgraphs/name/pooltogether/goerli-twab-rewards',
  [CHAIN_ID.mumbai]: 'https://api.thegraph.com/subgraphs/name/pooltogether/mumbai-twab-rewards',
  [CHAIN_ID.fuji]: 'https://api.thegraph.com/subgraphs/name/pooltogether/fuji-twab-rewards',
  [CHAIN_ID['arbitrum-goerli']]:
    'https://api.thegraph.com/subgraphs/name/pooltogether/arbitrum-goerli-twab-rewards'
}

export const getDepositGasLimit = (chainId: number) => {
  switch (chainId) {
    case CHAIN_ID.arbitrum:
    case CHAIN_ID['arbitrum-goerli']:
      return 1000000
    default:
      return 750000
  }
}

export const getWithdrawGasLimit = (chainId: number) => {
  switch (chainId) {
    case CHAIN_ID.arbitrum:
    case CHAIN_ID['arbitrum-goerli']:
      return 1000000
    default:
      return 750000
  }
}
