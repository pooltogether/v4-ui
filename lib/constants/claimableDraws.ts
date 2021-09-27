import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const CLAIMABLE_DRAWS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: ['0x29f6eF56b5767C56d7Bf41415C43796A1868f841'],
    [NETWORK.mumbai]: ['0x9c63E8ad7f46A4ed7c1955eBF05Cbdf82fD30144']
  }
})
