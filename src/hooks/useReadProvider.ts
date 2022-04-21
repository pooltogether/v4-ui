import { RPC_API_KEYS } from '@constants/config'
import { useReadProvider as _useReadProvider } from '@pooltogether/wallet-connection'

/**
 * Wrapper on useReadProvider from @pooltogether/wallet-connection that injects RPC API keys
 * @param chainId
 * @returns
 */
export const useReadProvider = (chainId: number) => {
  return _useReadProvider(chainId, RPC_API_KEYS)
}
