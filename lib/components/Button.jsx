import React from 'react'
import { omit } from 'lodash'

import { getButtonClasses } from 'lib/components/ButtonLink'

export function Button(props) {
  const classes = getButtonClasses(props)

  let newProps = omit(props, [
    'border',
    'bold',
    'text',
    'bg',
    'hoverBorder',
    'hoverText',
    'hoverBg',
    'noAnim',
    'outline',
    'secondary',
    'textSize',
  ])

  return <button
    {...newProps}
    className={classes}
  />
}
