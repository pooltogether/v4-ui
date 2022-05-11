import { SUPPORTED_CHAINS } from '@constants/config'
import { getAppEnv } from './getAppEnv'

export const getSupportedChains = () => {
  const appEnv = getAppEnv()
  return SUPPORTED_CHAINS[appEnv]
}
