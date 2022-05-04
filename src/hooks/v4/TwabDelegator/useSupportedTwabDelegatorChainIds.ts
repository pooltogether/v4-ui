import { useAppEnv } from '@hooks/useAppEnv'
import { SUPPORTED_CHAIN_IDS } from '@pooltogether/v4-twab-delegator-js'

export const useSupportedTwabDelegatorChainIds = () => {
  const appEnv = useAppEnv()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
