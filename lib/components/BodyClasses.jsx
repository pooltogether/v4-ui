import { useEffect } from 'react'
import { isMobile } from 'react-device-detect'

export function BodyClasses(props) {
  useEffect(() => {
    const body = document.body

    if (isMobile) {
      body.classList.add('device-is-touch')
    } else {
      body.classList.remove('device-is-touch')
    }
  }, [isMobile])

  return null
}
