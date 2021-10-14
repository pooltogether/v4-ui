import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0xF1B85984C641a21E2fa1159CD1FD0c1BC9843414'],
    [NETWORK.mumbai]: ['0x4C2d729E7052e12e09d29C95fd1f02Bd7471759e']
  }
})
