import { useAppEnvString } from '@hooks/useAppEnvString'

import { TWAB_REWARDS_SUPPORTED_CHAIN_IDS } from '@constants/promotions'

export const useSupportedTwabRewardsChainIds = () => {
  const appEnv = useAppEnvString()
  return TWAB_REWARDS_SUPPORTED_CHAIN_IDS[appEnv]
}
