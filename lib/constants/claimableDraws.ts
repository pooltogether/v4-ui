import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const CLAIMABLE_DRAWS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: ['0x6BEE64f6d4Ed4d0Ed4e5F20753D2f11716Aa566D'],
    [NETWORK.mumbai]: ['0x551825100D0bB7E1316Ba5dc33Ef4c2D473a1d1E']
  }
})
