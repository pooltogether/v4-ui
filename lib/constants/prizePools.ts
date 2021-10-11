import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0x19bfA054Dc6A1F428a9Eb840DeBbab01D61950aB',
    [NETWORK.mumbai]: '0x91017Aa153702617FD4361776212081884f0CEf8'
  }
})
