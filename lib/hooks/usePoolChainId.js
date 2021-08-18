import { APP_ENVIRONMENT, useAppEnv } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

export const usePoolChainId = () => {
  const { appEnv } = useAppEnv()
  // TODO: Switch this when we have production contracts
  // return appEnv === APP_ENVIRONMENT.mainnets ? NETWORK.mainnet : NETWORK.rinkeby
  return NETWORK.rinkeby
}
