import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0xbB8B489Aa452eBA03fe7B6AEe4946d984eAB3366',
    [NETWORK.mumbai]: '0x70dAC7CC7B2E96a7CB682B08935c391D024D7F7D'
  }
})
