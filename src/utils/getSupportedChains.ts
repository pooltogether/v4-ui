import { SUPPORTED_CHAINS } from '@constants/config'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'

export const getSupportedChains = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  const appEnv = isTestnets ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  return SUPPORTED_CHAINS[appEnv]
}
