import React from 'react'
import classnames from 'classnames'

export const Chip = (props) => {
  const { text } = props

  const color = props.color || 'highlight-3'

  const sizeClasses = 'text-xxxxxs xs:text-xxxxs sm:text-xxxxs lg:text-xxxs'
  const colorClasses = `text-${color} border-${color}`

  const classes = classnames(
    'mb-2 xs:mb-0 inline-block border relative inline-block tracking-wide py-1 px-2 sm:py-2 rounded-full uppercase',
    colorClasses,
    sizeClasses
  )

  return (
    <>
      <span
        className={classes}
        style={{
          lineHeight: '0.35rem',
          top: -2,
          left: 2,
        }}
      >
        {text}
      </span>
    </>
  )
}
