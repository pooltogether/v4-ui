import { CHAIN_NATIVE_CURRENCY } from '@src/constants/config'

export const useChainNativeCurrency = (chainId: number) => {
  return CHAIN_NATIVE_CURRENCY[chainId] || 'Unknown'
}
