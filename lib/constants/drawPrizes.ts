import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const DRAW_PRIZES = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x439777e646acD8CF484cB8097aa4324BcEf99067'],
    [NETWORK.mumbai]: ['0x1CFD3aAAD09E37B07523904Cd634540923a706df']
  }
})
