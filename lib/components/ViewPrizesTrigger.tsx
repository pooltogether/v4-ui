import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-js-client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrizeBreakdownModal } from './PrizeBreakdownModal'

export const ViewPrizeTiersTrigger = (props: {
  ticket: Token
  label?: string
  prizeTier?: PrizeTier
  className?: string
}) => {
  const { prizeTier, label } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.sm}
        className={props.className}
        onClick={() => setIsOpen(true)}
        disabled={!prizeTier}
      >
        {label || t('viewPrizeTiers', 'View prize tiers')}
      </SquareButton>

      <PrizeBreakdownModal
        {...props}
        prizeTier={prizeTier}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

ViewPrizeTiersTrigger.defaultProps = {
  className:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-inverse transition leading-none tracking-wide'
}
