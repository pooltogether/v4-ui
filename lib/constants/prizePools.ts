import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: '0xD9b5155ECbBb453e97D2B0e6a8264449f341A77E',
    [NETWORK.mumbai]: '0x81E87EB73A6df96Cfc4c9Fa6eCDfeA2DB7Cc70f6'
  }
})
