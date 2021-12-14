import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-js-client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrizeBreakdownModal } from './PrizeBreakdownModal'

interface ViewPrizesSheetTriggerProps {
  ticket: Token
  Button: React.FC<TriggerButtonProps>
  children?: React.ReactNode
  label?: string
  prizeTier?: PrizeTier
  className?: string
}

interface TriggerButtonProps {
  onClick: () => void
  disabled: boolean
  className?: string
}

export const ViewPrizesSheetCustomTrigger = (props: ViewPrizesSheetTriggerProps) => {
  const { children, prizeTier, label, Button } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <Button className={props.className} onClick={() => setIsOpen(true)} disabled={!prizeTier}>
        {children || label || t('viewPrizeTiers', 'View prize tiers')}
      </Button>

      <PrizeBreakdownModal
        {...props}
        prizeTier={prizeTier}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

export const ViewPrizesSheetButton = (props: Omit<ViewPrizesSheetTriggerProps, 'Button'>) => (
  <ViewPrizesSheetCustomTrigger
    {...props}
    Button={(props: TriggerButtonProps) => (
      <SquareButton {...props} theme={SquareButtonTheme.tealOutline} size={SquareButtonSize.sm} />
    )}
  />
)

ViewPrizesSheetCustomTrigger.defaultProps = {
  className:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-inverse transition leading-none tracking-wide'
}
