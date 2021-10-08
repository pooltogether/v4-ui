import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x2799C39cB4e7604854cb4491bEc9C48a2fC247a6'],
    [NETWORK.mumbai]: ['0x9E1118A87581e53D9b9548f9DB9bE69951d577c6']
  }
})
