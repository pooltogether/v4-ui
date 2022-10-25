import { useEffect } from 'react'

export const useActualFullScreen = () => {
  useEffect(() => {
    const resizeListener = () => {
      if (typeof window !== 'undefined') {
        let vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }
    if (typeof window !== 'undefined') {
      resizeListener()
      window.addEventListener('resize', resizeListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', resizeListener)
      }
    }
  }, [])
}
