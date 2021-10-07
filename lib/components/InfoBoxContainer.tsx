import React from 'react'
import classnames from 'classnames'

export const InfoBoxContainer = (props) => (
  <ul
    {...props}
    className={classnames(
      props.className,
      'w-full px-4 py-2 bg-light-purple-10 rounded-lg text-accent-1'
    )}
  />
)
