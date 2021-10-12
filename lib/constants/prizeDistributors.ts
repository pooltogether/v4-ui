import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x4844e7f933Fdb0083c144eb0D9013e71D2003b84'],
    [NETWORK.mumbai]: ['0x6c7330466aE67d1Eda70BF3ad50A75E8a269E51F']
  }
})
