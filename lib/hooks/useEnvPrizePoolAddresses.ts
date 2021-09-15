import { APP_ENVIRONMENT, useAppEnv } from '.yalc/@pooltogether/hooks/dist'
import { PRIZE_POOLS } from 'lib/constants/prizePools'

export const useEnvPrizePoolAddresses = () => {
  // const { appEnv } = useAppEnv()
  return PRIZE_POOLS[APP_ENVIRONMENT.testnets]
}
