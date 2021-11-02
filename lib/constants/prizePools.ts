import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be',
    [CHAIN_ID.polygon]: '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: '0xbB8B489Aa452eBA03fe7B6AEe4946d984eAB3366',
    [CHAIN_ID.mumbai]: '0x70dAC7CC7B2E96a7CB682B08935c391D024D7F7D'
  }
})
