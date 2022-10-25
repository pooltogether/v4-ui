import { useEffect, useState } from 'react'

const getKey = (key: string) => `dismissed:${key}`

export const useCachedDismiss = (key: string) => {
  const [dismissed, setDismissed] = useState<boolean>(false)

  useEffect(() => {
    const dismissedString = localStorage.getItem(getKey(key))
    if (dismissedString) {
      setDismissed(true)
    }
  }, [key])

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(getKey(key), new Date().getTime().toString())
  }

  const enable = () => {
    setDismissed(false)
    localStorage.removeItem(getKey(key))
  }

  return { dismissed, dismiss, enable }
}
