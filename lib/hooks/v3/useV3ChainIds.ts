import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

import { useAppEnvString } from '../useAppEnvString'

const V3_PRIZE_POOL_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [NETWORK.mainnet, NETWORK.bsc, NETWORK.polygon, NETWORK.celo],
  [APP_ENVIRONMENTS.testnets]: [NETWORK.rinkeby]
})

export const useV3ChainIds = () => {
  const appEnv = useAppEnvString()
  return V3_PRIZE_POOL_CHAIN_IDS[appEnv]
}
