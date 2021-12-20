import { PRIZE_DISTRIBUTORS } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvPrizeDistributorAddresses = () => {
  const appEnv = useAppEnvString()

  return PRIZE_DISTRIBUTORS[appEnv]
}
