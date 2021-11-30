import { PRIZE_POOLS } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvPrizePoolAddresses = () => {
  const appEnv = useAppEnvString()

  return PRIZE_POOLS[appEnv]
}
