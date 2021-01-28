import { useInterval } from 'beautiful-react-hooks'
import { addSeconds } from 'date-fns'
import { msToSeconds } from 'lib/utils/msToSeconds'
import { subtractDates } from 'lib/utils/subtractDates'
import { useEffect, useState } from 'react'

export const useTimeCountdown = (initialSecondsLeft, onZero, countBy = 1000) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft)

  console.log(initialSecondsLeft)

  const [isCleared, clearInterval] = useInterval(() => {
    const secondsToCountBy = msToSeconds(countBy).toNumber()
    const newRemainder = secondsLeft - secondsToCountBy
    setSecondsLeft(newRemainder)
  }, countBy)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onZero?.()
      clearInterval()
    }
  }, [secondsLeft])

  const currentDate = new Date(Date.now())
  const futureDate = addSeconds(currentDate, secondsLeft)
  const { days, hours, minutes, seconds } = subtractDates(futureDate, currentDate)
  return { days, hours, minutes, seconds, secondsLeft }
}
