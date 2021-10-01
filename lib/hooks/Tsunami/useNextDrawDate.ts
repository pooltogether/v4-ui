import { getNextDrawDate } from 'lib/utils/getNextDrawDate'
import { useEffect, useState } from 'react'
import { useTimeout } from 'beautiful-react-hooks'

export const useNextDrawDate = () => {
  const [nextDrawDate, setNextDrawDate] = useState(getNextDrawDate())
  const msUntilNextDrawDate = nextDrawDate.getTime() - new Date().getTime()

  useTimeout(() => {
    setNextDrawDate(getNextDrawDate())
  }, msUntilNextDrawDate)

  return nextDrawDate
}
