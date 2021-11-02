import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe',
    [CHAIN_ID.polygon]: '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: ['0xfe6bc11738b4011bd59705335fd98fe066a38b51'],
    [CHAIN_ID.mumbai]: ['0x05821572f54C10445379F5A1aD55f4FfFa9e187d']
  }
})
