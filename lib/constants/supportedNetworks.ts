import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const SUPPORTED_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [NETWORK.mainnet, NETWORK.polygon],
  [APP_ENVIRONMENTS.testnets]: [NETWORK.rinkeby, NETWORK.mumbai]
})

export const DEFAULT_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: NETWORK.mainnet,
  [APP_ENVIRONMENTS.testnets]: NETWORK.rinkeby
})
