import React from 'react'
import classnames from 'classnames'

export const InfoBoxContainer = (props) => {
  const { className, bgClassName, ...ulProps } = props
  return (
    <ul
      {...ulProps}
      className={classnames(
        className,
        bgClassName,
        'w-full px-4 py-2 rounded-lg text-accent-1 transition'
      )}
    />
  )
}

InfoBoxContainer.defaultProps = {
  bgClassName: 'bg-light-purple-10'
}
