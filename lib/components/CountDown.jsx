import { useTimeCountdown } from 'lib/hooks/useTimeCountdown'
import classnames from 'classnames'
import React from 'react'

export const CountDown = (props) => {
  const { seconds: secondsToCountDown, changeColors, onZero, className } = props
  const { days, hours, minutes, seconds, secondsLeft } = useTimeCountdown(
    secondsToCountDown,
    onZero
  )

  const textColorClass = getTextColorClass(secondsLeft, changeColors)

  return (
    <div className={classnames('flex', textColorClass, className)}>
      <TimeBlock amount={days} label='DAY' />
      <span className='px-1'>:</span>
      <TimeBlock amount={hours} label='HR' />
      <span className='px-1'>:</span>
      <TimeBlock amount={minutes} label='MIN' />
      <span className='px-1'>:</span>
      <TimeBlock amount={seconds} label='SEC' />
    </div>
  )
}

CountDown.defaultProps = {
  changeColors: true
}

const TimeBlock = (props) => {
  const { amount, label } = props

  const amountArray = String(amount).split('')
  const firstDigit = amountArray.length < 2 ? '0' : amountArray[0]
  const secondDigit = amountArray.length > 1 ? amountArray[1] : amountArray[0]

  return (
    <div className='flex flex-col'>
      <div className='flex'>
        <span className='bg-tertiary font-bold rounded-sm py-1 px-2 mr-1'>{firstDigit}</span>
        <span className='bg-tertiary font-bold rounded-sm py-1 px-2'>{secondDigit}</span>
      </div>
      <span className='text-center text-inverse text-xxxs sm:text-xxs'>{label}</span>
    </div>
  )
}

const getTextColorClass = (secondsLeft, changeColors) => {
  if (!changeColors) return 'text-inverse'

  if (secondsLeft >= 86400) {
    return 'text-green'
  } else if (secondsLeft >= 3600) {
    return 'text-orange'
  } else {
    return 'text-red'
  }
}
