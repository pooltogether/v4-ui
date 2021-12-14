import { SUPPORTED_CHAIN_IDS } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useSupportedChainIds = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
