import { Network } from 'lib/constants/network'
import { ETHEREUM_NETWORK, POLYGON_NETWORK } from 'lib/constants/supportedNetworks'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvironmentNetworks = () => {
  const appEnv = useAppEnvString()
  return {
    [Network.ethereum]: ETHEREUM_NETWORK[appEnv],
    [Network.polygon]: POLYGON_NETWORK[appEnv]
  }
}
