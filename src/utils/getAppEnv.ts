import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'

// export const getAppEnv = () =>
//   getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

// TODO: Add back actual environments
export const getAppEnv = () => APP_ENVIRONMENTS.testnets
