import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

export const SUPPORTED_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.polygon, CHAIN_ID.mainnet],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.mumbai, CHAIN_ID.rinkeby]
})

export const DEFAULT_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

/**
 * Ethereum
 * Mainnet - 1
 * Testnet - 4
 */
export const ETHEREUM_NETWORK = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.mainnet,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

/**
 * Polygon
 * Mainnet - 137
 * Testnet - 13337
 */
export const POLYGON_NETWORK = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})
