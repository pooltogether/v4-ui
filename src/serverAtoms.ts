import { CoingeckoExchangeRates } from '@pooltogether/hooks'
import { atom, useAtom } from 'jotai'

export const exchangeRatesAtom = atom<CoingeckoExchangeRates>(undefined)

export const useExchangeRates = () => {
  const [exchangeRates] = useAtom(exchangeRatesAtom)
  return exchangeRates
}
