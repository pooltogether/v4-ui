import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe',
    [CHAIN_ID.polygon]: '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: ['0xf49df4D05d9C99160777b79AdE9aA9222b202eAA'],
    [CHAIN_ID.mumbai]: ['0x8F3D72C660cE938FA2A5138a5EDb6496C81fADcC']
  }
})
