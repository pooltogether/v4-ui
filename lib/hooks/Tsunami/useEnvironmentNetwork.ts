import { Network } from 'lib/constants/config'
import { ETHEREUM_NETWORK, POLYGON_NETWORK, AVALANCHE_NETWORK } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvironmentNetworks = () => {
  const appEnv = useAppEnvString()
  return {
    [Network.ethereum]: ETHEREUM_NETWORK[appEnv],
    [Network.polygon]: POLYGON_NETWORK[appEnv],
    [Network.polygon]: AVALANCHE_NETWORK[appEnv]
  }
}
