import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0xb092415165e22a069922bff76e9aAB404E947A49',
    [NETWORK.mumbai]: '0x72De7A75Fb7c094e410205aFAF9615E7dAA120b3'
  }
})
