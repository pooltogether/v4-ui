import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_DISTRIBUTORS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENTS.testnets]: {
    [NETWORK.rinkeby]: ['0x66b05Bd3Cc63180370BcA3c3E23a88dB17043E3b'],
    [NETWORK.mumbai]: ['0x1469C3C2F8CbACafCed0A271711e3491700b4f5d']
  }
})
