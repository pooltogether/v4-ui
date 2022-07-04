import classNames from 'classnames'
import React from 'react'

export const PrizePoolDepositList = (props: {
  className?: string
  bgClassName?: string
  children: React.ReactNode
}) => (
  <ul className={classNames('space-y-1', props.bgClassName, props.className)}>{props.children}</ul>
)

PrizePoolDepositList.defaultProps = {
  bgClassName: ''
}
