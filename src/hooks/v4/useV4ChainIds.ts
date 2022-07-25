import { V4_CHAIN_IDS } from '@constants/config'
import { useAppEnv } from '../useAppEnv'

export const useV4ChainIds = () => {
  const appEnv = useAppEnv()
  return V4_CHAIN_IDS[appEnv]
}
