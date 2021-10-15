import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be',
    [NETWORK.polygon]: '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0xbB8B489Aa452eBA03fe7B6AEe4946d984eAB3366',
    [NETWORK.mumbai]: '0x70dAC7CC7B2E96a7CB682B08935c391D024D7F7D'
  }
})
