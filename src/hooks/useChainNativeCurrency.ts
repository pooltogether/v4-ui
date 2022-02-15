import { CHAIN_NATIVE_CURRENCY } from '@constants/config'

export const useChainNativeCurrency = (chainId: number) => {
  return CHAIN_NATIVE_CURRENCY[chainId] || 'Unknown'
}
