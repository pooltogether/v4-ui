import { APP_ENVIRONMENT } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const DRAW_PRIZES = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: ['0x728D7D11094940eF1b7296D406e96332D8cbd1B8'],
    [NETWORK.mumbai]: ['0x19eA0E59B6C4729E1DEc5F25663962F28868F881']
  }
})
