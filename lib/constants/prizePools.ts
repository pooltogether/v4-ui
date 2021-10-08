import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: '0x0e4BBece5Cf94c09Bc168fFbe3b6DF8a43a94446',
    [NETWORK.mumbai]: '0xbCc954625cB734872E2b67bbbE2155963a41C1Ca'
  }
})
