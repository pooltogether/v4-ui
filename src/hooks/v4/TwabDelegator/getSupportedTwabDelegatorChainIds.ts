import { getAppEnvString } from '@pooltogether/hooks'
import { SUPPORTED_CHAIN_IDS } from '@pooltogether/v4-twab-delegator-js'

export const getSupportedTwabDelegatorChainIds = (): number[] => {
  const appEnv = getAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
