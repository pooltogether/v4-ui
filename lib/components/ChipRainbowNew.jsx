import React from 'react'
import classnames from 'classnames'

import DDChipSvg from 'assets/images/d-d-chip.svg'

export const ChipRainbowNew = (props) => {
  const { text } = props

  let sizeClasses = ''
  let imgClasses = 'w-8 lg:w-10'

  const classes = classnames('relative inline-block tracking-wide', sizeClasses)

  return (
    <>
      <div
        className={classes}
        style={{
          top: -4,
          left: 4
        }}
      >
        <img src={DDChipSvg} className={imgClasses} />{' '}
        <span
          className='uppercase absolute l-0 t-0 r-0 b-0 text-xxxs text-primary font-mono'
          style={{
            top: 1
          }}
        >
          {text}
        </span>
      </div>
    </>
  )
}
