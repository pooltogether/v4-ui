import { APP_ENVIRONMENT, useAppEnv } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

// TODO: How are we going to handle multiple chains.
export const useSelectedNetwork = () => {
  const { appEnv } = useAppEnv()
  if (appEnv === APP_ENVIRONMENT.testnets) {
    return NETWORK.rinkeby
  }
  return NETWORK.rinkeby
}
