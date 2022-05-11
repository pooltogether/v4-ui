import { V4_CHAIN_IDS } from '@constants/config'
import { getAppEnv } from './getAppEnv'

export const getSupportedChainIds = () => {
  const appEnv = getAppEnv()
  return V4_CHAIN_IDS[appEnv]
}
