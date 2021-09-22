import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: '0xF66E1ebB2101a155D0BF58BbB7E4f80a87d3CccD',
    [NETWORK.mumbai]: '0x3969d3B069Abe727E11300E68AFA6848B1EC53bA'
  }
})
