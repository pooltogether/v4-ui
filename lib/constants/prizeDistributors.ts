import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0xa9ea790946E5Cd4b3C596293113bD6c0fF61e4d6'],
    [NETWORK.mumbai]: ['0x53511a74B66ecD1F3e487DfE69503169E0f5c70F']
  }
})
