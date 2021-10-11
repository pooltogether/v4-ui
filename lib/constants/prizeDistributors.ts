import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x6FFEE50d8777bCf50Fe2B43a9AB7Db128a4bCDe8'],
    [NETWORK.mumbai]: ['0x2d537Fb215Bf4E8B586a0f757D62325A0C06fA87']
  }
})
