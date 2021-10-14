import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x5249073A838F18EaE17d66DEfb4fFA9892D1f43A'],
    [NETWORK.mumbai]: ['0x506eCd974183F46f68de9093159F83addB46A26C']
  }
})
