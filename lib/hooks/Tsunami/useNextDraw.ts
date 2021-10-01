import { getNextDraw } from 'lib/utils/getNextDraw'
import { useEffect, useState } from 'react'

export const useNextDraw = () => {
  const [nextDraw, setNextDraw] = useState(getNextDraw())

  useEffect(() => {
    const currentDate = new Date()
    const msUntilNextDraw = nextDraw.getTime() - currentDate.getTime()

    const timeout = setTimeout(() => {
      setNextDraw(getNextDraw())
    }, msUntilNextDraw)

    return () => {
      clearTimeout(timeout)
    }
  }, [nextDraw])

  return nextDraw
}
