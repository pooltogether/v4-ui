import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const SUPPORTED_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [NETWORK.polygon, NETWORK.mainnet],
  [APP_ENVIRONMENTS.testnets]: [NETWORK.mumbai, NETWORK.rinkeby]
})

export const DEFAULT_NETWORKS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: NETWORK.polygon,
  [APP_ENVIRONMENTS.testnets]: NETWORK.mumbai
})
