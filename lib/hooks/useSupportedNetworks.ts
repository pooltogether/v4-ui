import { useAppEnv } from '@pooltogether/hooks'
import { SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'

export const useSupportedNetworks = () => {
  const { appEnv } = useAppEnv()
  return SUPPORTED_NETWORKS[appEnv]
}
