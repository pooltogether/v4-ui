import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'

export const getAppEnv = () =>
  getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
