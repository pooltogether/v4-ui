import { NETWORK } from '@pooltogether/utilities'

export const CHAIN_NATIVE_CURRENCY = Object.freeze({
  [NETWORK.mainnet]: 'ETH',
  [NETWORK.rinkeby]: 'ETH',
  [NETWORK.matic]: 'MATIC',
  [NETWORK.mumbai]: 'MATIC'
})
