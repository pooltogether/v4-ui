import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0x1536205F40B96A75E1ce8316D2f47cb1cBD914f9',
    [NETWORK.mumbai]: '0xA8F32475438733B974CD4F19Ba8f97484EeB95a3'
  }
})
