import { PRIZE_DISTRIBUTORS } from '../../../constants/prizeDistributors'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvPrizeDistributorAddresses = () => {
  const appEnv = useAppEnvString()

  return PRIZE_DISTRIBUTORS[appEnv]
}
