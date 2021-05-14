import React from 'react'
import classnames from 'classnames'

export function CountBadge(props) {
  const { backgroundClass, count, sizeClasses } = props

  const color = props.inNav ? '' : 'red'

  return (
    <span
      title='active proposals to vote on'
      className={classnames(
        'text-white rounded-full ml-2 flex flex-col items-center justify-center font-bold',
        sizeClasses,
        backgroundClass
      )}
    >
      <span className='relative' style={{ left: color === 'red' ? -1 : 0 }}>
        {count}
      </span>
    </span>
  )
}
