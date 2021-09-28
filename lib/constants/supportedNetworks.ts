import { APP_ENVIRONMENT } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const SUPPORTED_NETWORKS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: [NETWORK.mainnet, NETWORK.polygon],
  [APP_ENVIRONMENT.testnets]: [NETWORK.rinkeby, NETWORK.mumbai]
})

export const DEFAULT_NETWORKS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: NETWORK.mainnet,
  [APP_ENVIRONMENT.testnets]: NETWORK.rinkeby
})
