import { useAppEnv } from '@pooltogether/hooks'
import { PRIZE_POOLS } from 'lib/constants/prizePools'

export const useEnvPrizePoolAddresses = () => {
  const { appEnv } = useAppEnv()
  return PRIZE_POOLS[appEnv]
}
