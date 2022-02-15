import { SUPPORTED_CHAIN_IDS } from '@src/constants/config'
import { useAppEnvString } from '@src/hooks/useAppEnvString'

export const useSupportedChainIds = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
