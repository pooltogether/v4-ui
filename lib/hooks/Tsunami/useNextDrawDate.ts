import { getNextDrawDate } from 'lib/utils/getNextDrawDate'
import { useEffect, useState } from 'react'

export const useNextDrawDate = () => {
  const [nextDrawDate, setNextDrawDate] = useState(getNextDrawDate())

  useEffect(() => {
    const currentDate = new Date()
    const msUntilNextDrawDate = nextDrawDate.getTime() - currentDate.getTime()

    const timeout = setTimeout(() => {
      setNextDrawDate(getNextDrawDate())
    }, msUntilNextDrawDate)

    return () => {
      clearTimeout(timeout)
    }
  }, [nextDrawDate])

  return nextDrawDate
}
