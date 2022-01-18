import React, { useEffect, useState } from 'react'
import ReactCountUp from 'react-countup'
import { usePreviousValue } from 'beautiful-react-hooks'

interface CountUpProps {
  countFrom?: number
  countTo: number
  decimals?: number
  duration?: number
}

export function CountUp(props: CountUpProps) {
  const { countTo, decimals, duration, countFrom } = props

  let [value, setValue] = useState(countFrom)
  let prev = usePreviousValue(value)
  useEffect(() => {
    setValue(countTo)
  }, [countTo])

  let decimalsToUse = countTo > 10000 ? 0 : decimals

  return (
    <ReactCountUp
      start={prev}
      end={value}
      duration={duration}
      separator={','}
      decimals={decimalsToUse}
    />
  )
}

CountUp.defaultProps = {
  countFrom: 0,
  decimals: 2,
  duration: 1.4
}
