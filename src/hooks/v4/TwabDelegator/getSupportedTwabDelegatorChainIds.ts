import { useAppEnvString } from '@hooks/useAppEnvString'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { SUPPORTED_CHAIN_IDS } from '@pooltogether/v4-twab-delegator-js'

export const getSupportedTwabDelegatorChainIds = (): number[] => {
  const isTestnets = getStoredIsTestnetsCookie()
  const appEnv = isTestnets ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  return SUPPORTED_CHAIN_IDS[appEnv]
}
