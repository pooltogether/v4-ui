import { APP_ENVIRONMENT } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: '0xdd42d57861d3861b77F0FC55b31521fa5B2DE257',
    [NETWORK.mumbai]: '0xAa86666831156241B106b32E56447586a33f0b04'
  }
})
