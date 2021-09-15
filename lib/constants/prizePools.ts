import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: '0x3D99eB28985adcd105947Fbb8D90b49cCe1ec562',
    [NETWORK.mumbai]: '0x9529Dc4daF35b55Af736985F31B3929D743350d1'
  }
})
