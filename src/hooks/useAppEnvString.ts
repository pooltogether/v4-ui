import { useIsTestnets, APP_ENVIRONMENTS } from '@pooltogether/hooks'

export const useAppEnvString = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
}
