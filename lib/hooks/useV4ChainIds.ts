import { V4_CHAIN_IDS } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useV4ChainIds = () => {
  const appEnv = useAppEnvString()
  return V4_CHAIN_IDS[appEnv]
}
