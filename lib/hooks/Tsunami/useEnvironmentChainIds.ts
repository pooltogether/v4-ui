import { getEnvironmentChainIds } from 'lib/constants/config'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'
import { useMemo } from 'react'

export const useEnvironmentChainIds = () => {
  const appEnv = useAppEnvString()
  return useMemo(() => getEnvironmentChainIds(appEnv), [appEnv])
}
