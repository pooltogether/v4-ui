import { getEnvironmentNetworks } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'
import { useMemo } from 'react'

export const useEnvironmentNetworks = () => {
  const appEnv = useAppEnvString()
  return useMemo(() => getEnvironmentNetworks(appEnv), [appEnv])
}
