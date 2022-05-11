import { V3_CHAIN_IDS } from '@constants/config'
import { useAppEnv } from '../useAppEnv'

export const useV3ChainIds = () => {
  const appEnv = useAppEnv()
  return V3_CHAIN_IDS[appEnv]
}
