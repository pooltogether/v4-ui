import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe',
    [NETWORK.polygon]: '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0xfe6bc11738b4011bd59705335fd98fe066a38b51'],
    [NETWORK.mumbai]: ['0x05821572f54C10445379F5A1aD55f4FfFa9e187d']
  }
})
