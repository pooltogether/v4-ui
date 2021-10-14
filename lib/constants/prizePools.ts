import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0x49a53Dd7889Cf765AcCC39C5B055fD1869D74f5D',
    [NETWORK.mumbai]: '0x4658f736b93dCDdCbCe46cDe955970E697fd351f'
  }
})
