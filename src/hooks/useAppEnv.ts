import { useIsTestnets, APP_ENVIRONMENTS } from '@pooltogether/hooks'

// export const useAppEnv = () => {
//   const { isTestnets } = useIsTestnets()
//   return isTestnets ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
// }

// TODO: Add back actual environments

export const useAppEnv = () => {
  return APP_ENVIRONMENTS.testnets
}
