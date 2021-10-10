import { useState } from 'react'
import { useTimeout } from 'beautiful-react-hooks'

import { getNextDrawDate } from 'lib/utils/getNextDrawDate'

// TODO: This doesn't quite work.
// If draw date is Friday 8pm, but draws are ready at 6pm, anyone who visits from 6-8 will see
// the latest draw & a countdown saying "next draw is at 8", but they can already access it.
export const useNextDrawDate = () => {
  const [nextDrawDate, setNextDrawDate] = useState(getNextDrawDate())
  const msUntilNextDrawDate = nextDrawDate.getTime() - new Date().getTime()

  useTimeout(() => {
    setNextDrawDate(getNextDrawDate())
  }, msUntilNextDrawDate)

  return nextDrawDate
}
