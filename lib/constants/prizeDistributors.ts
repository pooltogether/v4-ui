import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0xfe6bc11738b4011bd59705335fd98fe066a38b51'],
    [NETWORK.mumbai]: ['0x05821572f54C10445379F5A1aD55f4FfFa9e187d']
  }
})
