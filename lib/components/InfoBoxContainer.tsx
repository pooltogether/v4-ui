import React from 'react'
import classnames from 'classnames'

export const InfoBoxContainer = (props) => (
  <ul
    {...props}
    className={classnames(
      props.className,
      props.bgClassName ? props.bgClassName : 'bg-light-purple-10',
      'w-full px-4 py-2 rounded-lg text-accent-1 transition'
    )}
  />
)
