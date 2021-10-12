import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0xD204bade6940C655c0Eb03C9559943a8e368A461',
    [NETWORK.mumbai]: '0x692F55051Dc060d94227467EE4fbDE72d370728C'
  }
})
