import React from 'react'
import { usePreviousValue } from 'beautiful-react-hooks'
import CountUp from 'react-countup'

export const NumberCountUp = (props) => {
  const { amount, ...countUpProps } = props
  const prevAmount = usePreviousValue(amount)

  return <CountUp start={prevAmount} end={amount} {...countUpProps} />
}

NumberCountUp.defaultProps = {
  amount: 0
}
