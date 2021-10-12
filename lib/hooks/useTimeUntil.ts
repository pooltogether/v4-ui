import { getTimeBreakdown, msToS } from '@pooltogether/utilities'
import { useInterval } from 'beautiful-react-hooks'
import { useEffect, useState } from 'react'

export const useTimeUntil = (_epochTimeSeconds: number = 0) => {
  const [epochTimeSeconds, setEpochTimeSeconds] = useState(_epochTimeSeconds)
  const [secondsLeft, setSecondsLeft] = useState(getInitialSecondsLeft(epochTimeSeconds))
  const [timeBreakdown, setTimeBreakdown] = useState<{
    years: number
    weeks: number
    days: number
    hours: number
    minutes: number
    seconds: number
  }>(getTimeBreakdown(secondsLeft))

  useEffect(() => {
    if (_epochTimeSeconds !== epochTimeSeconds) {
      setEpochTimeSeconds(_epochTimeSeconds)
      const secondsLeft = getInitialSecondsLeft(_epochTimeSeconds)
      setSecondsLeft(secondsLeft)
      setTimeBreakdown(getTimeBreakdown(secondsLeft))
    }
  }, [_epochTimeSeconds])

  useInterval(() => {
    const newRemainder = secondsLeft - 1
    if (newRemainder >= 0) {
      setSecondsLeft(newRemainder)
      setTimeBreakdown(getTimeBreakdown(newRemainder))
    }
  }, 1000)

  return { ...timeBreakdown, secondsLeft }
}

const getInitialSecondsLeft = (epochTimeSeconds: number) => {
  const currentTimeSeconds = Math.round(msToS(Date.now()))
  if (epochTimeSeconds > currentTimeSeconds) {
    return epochTimeSeconds - currentTimeSeconds
  }
  return 0
}
