import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { PrizeDistribution } from '@pooltogether/v4-js-client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrizeBreakdownModal } from './PrizeBreakdownModal'

export const ViewPrizeTiersTrigger = (props: {
  token: Token
  label?: string
  prizeDistribution?: PrizeDistribution
  className?: string
}) => {
  const { prizeDistribution, label } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  if (!prizeDistribution) return null

  return (
    <>
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.sm}
        className={props.className}
        onClick={() => setIsOpen(true)}
      >
        {label || t('viewPrizeTiers', 'View prize tiers')}
      </SquareButton>

      <PrizeBreakdownModal
        {...props}
        prizeDistribution={prizeDistribution}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

ViewPrizeTiersTrigger.defaultProps = {
  className:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-white transition leading-none tracking-wide'
}
