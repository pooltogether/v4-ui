import { useAtom, useSetAtom } from 'jotai'
import { selectedCurrencyIdAtom, setSelectedCurrencyIdWriteAtom } from '../atoms'

export const useSelectedCurrency = () => {
  const [currency] = useAtom(selectedCurrencyIdAtom)
  const setCurrency = useSetAtom(setSelectedCurrencyIdWriteAtom)
  return {
    currency,
    setCurrency
  }
}
