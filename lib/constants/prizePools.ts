import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0x6C8E5260FF357b80cb7c1Fc6882ff52416629355',
    [NETWORK.mumbai]: '0x3b694ce9d12F0bF032bF002b3b0473Cb58bbe3F0'
  }
})
