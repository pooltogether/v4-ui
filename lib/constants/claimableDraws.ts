import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const CLAIMABLE_DRAWS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: ['0x780541141d3eea11ce73A73fE33Bbf84F91d9338'],
    [NETWORK.mumbai]: ['0xcF343B23178869BE12831D4f365dd4BfbCA8066As']
  }
})
