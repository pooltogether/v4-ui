import React, { useState, cloneElement } from 'react'
import classnames from 'classnames'
import { useTooltip, TooltipPopup } from '@reach/tooltip'

import { useTranslation } from 'react-i18next'
import { Button } from 'lib/components/Button'
import { QuestionMarkCircle } from 'lib/components/QuestionMarkCircle'

// Center the tooltip, but collisions will win
const custom = (triggerRect, tooltipRect) => {
  const body = document.body
  const triggerCenter = triggerRect.left + triggerRect.width / 2
  const left = triggerCenter - tooltipRect.width / 2
  const maxLeft = body.offsetWidth - tooltipRect.width - 2
  // const maxLeft = window.innerWidth - tooltipRect.width - 2 - 30;

  return {
    left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
    top: triggerRect.bottom
  }
}

export function PTHint(props) {
  const { t } = useTranslation()
  const { children, className, isButton, title } = props
  let { tip } = props

  const [trigger, tooltip] = useTooltip()

  const [isVisible, setIsVisible] = useState(false)

  const show = (e) => {
    setIsVisible(true)
  }

  const hide = (e) => {
    setIsVisible(false)
  }

  const toggleVisible = (e) => {
    setIsVisible(!isVisible)
  }

  tip = (
    <div>
      {tip}

      <div className='sm:hidden my-4'>
        <Button onClick={toggleVisible}>{t('close')}</Button>
      </div>
    </div>
  )

  if (title) {
    tip = (
      <>
        <div className='-mx-8 bg-highlight-5 px-8 py-4 -mt-6 rounded-t-lg'>
          <h5 className='text-green'>{title}</h5>
        </div>

        <div className='pt-4'>{tip}</div>
      </>
    )
  }

  return (
    <>
      <div
        className={classnames(className, 'relative flex cursor-pointer', {
          'button-partially-disabled': isButton
        })}
        onMouseOut={hide}
      >
        <div
          {...trigger}
          onMouseEnter={show}
          // onClick={toggleVisible}
          onTouchStart={toggleVisible}
          className={classnames('cursor-pointer h-full w-full l-0 r-0 t-0 b-0 absolute')}
          style={{
            zIndex: 12314082
          }}
        />

        {children ? children : <QuestionMarkCircle />}
      </div>

      <TooltipPopup {...tooltip} isVisible={isVisible} label={tip} position={custom} />
    </>
  )
}
