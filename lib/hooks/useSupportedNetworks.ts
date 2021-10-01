import { SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useSupportedNetworks = () => {
  const appEnv = useAppEnvString()

  return SUPPORTED_NETWORKS[appEnv]
}
