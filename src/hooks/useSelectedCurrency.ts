import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { selectedCurrencyIdAtom, setSelectedCurrencyIdWriteAtom } from '../atoms'

export const useSelectedCurrency = () => {
  const [currency] = useAtom(selectedCurrencyIdAtom)
  const setCurrency = useUpdateAtom(setSelectedCurrencyIdWriteAtom)
  return {
    currency,
    setCurrency
  }
}
