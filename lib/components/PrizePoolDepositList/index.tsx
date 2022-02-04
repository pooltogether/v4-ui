import classNames from 'classnames'
import React from 'react'

export const PrizePoolDepositList = (props: {
  className?: string
  bgClassName?: string
  children: React.ReactNode
}) => (
  <ul className={classNames('rounded-lg p-4 space-y-4', props.bgClassName, props.className)}>
    {props.children}
  </ul>
)

PrizePoolDepositList.defaultProps = {
  bgClassName: 'bg-pt-purple-lightest dark:bg-pt-purple'
}
