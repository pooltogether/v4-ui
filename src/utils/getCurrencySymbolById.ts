import { SUPPORTED_CURRENCIES } from '@constants/currencies'

export const getCurrencySymbolById = (id: string) => {
  return SUPPORTED_CURRENCIES[id]?.symbol
}
