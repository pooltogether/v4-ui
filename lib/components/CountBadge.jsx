import React from 'react'
import classnames from 'classnames'

export function CountBadge(props) {
  const { backgroundClass, count, sizeClasses, textTopPos, textLeftPos } = props

  return (
    <span
      title='active proposals to vote on'
      className={classnames(
        'text-white rounded-full ml-2 flex flex-col items-center justify-center font-bold',
        sizeClasses,
        backgroundClass
      )}
    >
      <span
        className='relative'
        style={{ top: textTopPos ? textTopPos : 0, left: textLeftPos ? textLeftPos : 0 }}
      >
        {count}
      </span>
    </span>
  )
}
