import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'

export const Dot = (props: { className?: string }) => {
  const [id] = useState(Math.random())

  return (
    <FeatherIcon
      icon={id > 0.5 ? 'circle' : 'triangle'}
      className={classNames(props.className, 'absolute stroke-1 w-2 xs:w-3 fill-current', {
        'text-pt-green': id > 0.8,
        'text-pt-purple-light': 0.3 < id && id <= 0.8,
        'text-pt-red-light': 0.2 < id && id <= 0.3,
        'text-gradient-yellow': 0.1 < id && id <= 0.2,
        'text-gradient-cyan': id <= 0.1,
        'transform rotate-12': id > 0.6,
        'transform rotate-0': id <= 0.4 && id <= 0.3,
        'transform rotate-90': id < 0.3,
        'hidden': id < 0.2,
        'hidden xs:block': id >= 0.2 && id < 0.5
      })}
    />
  )
}

Dot.defaultProps = {
  square: false
}