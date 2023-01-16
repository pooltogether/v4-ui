import { useEffect, useState } from 'react'

const key = 'selectedCurrency'

export const useCachedCurrency = () => {
  const [currency, setCurrency] = useState<string>('usd')

  useEffect(() => {
    const cachedCurrency = localStorage.getItem(key)
    if (!!cachedCurrency) {
      setCurrency(cachedCurrency)
    }
  }, [])

  const updateCurrency = (id: string) => {
    setCurrency(id)
    localStorage.setItem(key, id)
  }

  return { currency, updateCurrency }
}
