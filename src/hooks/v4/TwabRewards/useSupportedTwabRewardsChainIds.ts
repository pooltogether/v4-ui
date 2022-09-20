import { TWAB_REWARDS_SUPPORTED_CHAIN_IDS } from '@constants/promotions'
import { useAppEnvString } from '@hooks/useAppEnvString'


export const useSupportedTwabRewardsChainIds = () => {
  const appEnv = useAppEnvString()
  return TWAB_REWARDS_SUPPORTED_CHAIN_IDS[appEnv]
}
