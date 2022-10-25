import { V4_CHAIN_IDS } from '@constants/config'
import { getAppEnv } from './getAppEnv'

export const getV4SupportedChainIds = () => {
  const appEnv = getAppEnv()
  return V4_CHAIN_IDS[appEnv]
}
