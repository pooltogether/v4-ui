import { V4_CHAIN_IDS } from '@constants/config'
import { useAppEnvString } from '../useAppEnvString'

export const useV4ChainIds = () => {
  const appEnv = useAppEnvString()
  return V4_CHAIN_IDS[appEnv]
}
