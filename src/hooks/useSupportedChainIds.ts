import { SUPPORTED_CHAIN_IDS } from '@constants/config'
import { useAppEnv } from '@hooks/useAppEnv'

export const useSupportedChainIds = () => {
  const appEnv = useAppEnv()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
