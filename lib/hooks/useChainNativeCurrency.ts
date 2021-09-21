import { CHAIN_NATIVE_CURRENCY } from 'lib/constants/chainNativeCurrencies'

export const useChainNativeCurrency = (chainId: number) => {
  return CHAIN_NATIVE_CURRENCY[chainId] || 'Unknown'
}
