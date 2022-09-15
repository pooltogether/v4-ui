import { V3_CHAIN_IDS } from '@constants/config'

import { useAppEnvString } from '../useAppEnvString'

export const useV3ChainIds = () => {
  const appEnv = useAppEnvString()
  return V3_CHAIN_IDS[appEnv]
}
