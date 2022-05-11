import { Token } from '@pooltogether/hooks'
import { PrizeTier } from '@pooltogether/v4-client-js'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrizeBreakdownModal } from './PrizeBreakdownModal'

interface ViewPrizesSheetTriggerProps {
  prizeToken: Token
  Button: React.FC<TriggerButtonProps>
  prizeTier: PrizeTier
  children?: React.ReactNode
  label?: string
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

      <PrizeBreakdownModal {...props} isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

ViewPrizesSheetCustomTrigger.defaultProps = {
  className:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-inverse transition leading-none tracking-wide'
}
