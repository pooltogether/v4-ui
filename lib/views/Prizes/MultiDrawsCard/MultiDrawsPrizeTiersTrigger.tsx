import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import classNames from 'classnames'
import { DrawData } from 'lib/types/v4'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MultiDrawPrizeBreakdownSheet } from './MultiDrawPrizeBreakdownSheet'

export const MultiDrawsPrizeTiersTrigger = (props: {
  ticket: Token
  drawDatas: { [drawId: number]: DrawData }
  label?: string
  className?: string
  textClassName?: string
}) => {
  const { drawDatas, label, ticket, textClassName, className } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  if (!drawDatas || Object.keys(drawDatas).length === 0) return null

  return (
    <>
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.sm}
        className={classNames(className, textClassName)}
        onClick={() => setIsOpen(true)}
      >
        {label || t('viewPrizeTiers', 'View prize tiers')}
      </SquareButton>

      <MultiDrawPrizeBreakdownSheet
        drawDatas={drawDatas}
        ticket={ticket}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

MultiDrawsPrizeTiersTrigger.defaultProps = {
  textClassName:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-inverse transition leading-none tracking-wide'
}
