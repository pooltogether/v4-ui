import React from 'react'
import classnames from 'classnames'

import IconInfo from 'assets/images/icon-info.svg'

export function QuestionMarkCircle(props) {
  const { white } = props

  if (!white) {
    return <>
      <img src={IconInfo} />
    </>
  }

  let defaultClasses = 'bg-overlay-white text-primary'
  if (white) {
    defaultClasses = 'bg-transparent text-white border-white border-2'
  }
  
  return <>
    <span
      className={classnames(
        defaultClasses,
        'flex items-center justify-center rounded-full w-4 h-4 mx-1',
      )}
    >
      <span
        className='relative font-mono font-bold text-xs'
        style={{
          left: '0.02rem',
          top: '0.04rem'
        }}
      >
        ?
      </span>
    </span>
  </>
}
