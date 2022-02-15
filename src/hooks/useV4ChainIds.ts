import { V4_CHAIN_IDS } from '@src/constants/config'
import { useAppEnvString } from '@src/hooks/useAppEnvString'

export const useV4ChainIds = () => {
  const appEnv = useAppEnvString()
  return V4_CHAIN_IDS[appEnv]
}
