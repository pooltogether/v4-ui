import React from 'react'
import classnames from 'classnames'

export const V3LoadingDots = (props) => (
  <span className={classnames('lds-ellipsis', props.className)}>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </span>
)
