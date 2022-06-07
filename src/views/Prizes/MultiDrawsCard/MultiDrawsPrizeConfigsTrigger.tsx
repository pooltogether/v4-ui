import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { DrawData } from '../../../interfaces/v4'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MultiDrawPrizeBreakdownSheet } from './MultiDrawPrizeBreakdownSheet'

export const MultiDrawsPrizeConfigsTrigger = (props: {
  prizeToken: Token
  drawDatas: { [drawId: number]: DrawData }
  label?: string
  className?: string
  textClassName?: string
}) => {
  const { drawDatas, label, prizeToken, textClassName, className } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  if (!drawDatas || Object.keys(drawDatas).length === 0) return null

  return (
    <>
      <button
        className={classNames(className, textClassName, 'flex items-center')}
        onClick={() => setIsOpen(true)}
      >
        {label || t('viewPrizes', 'View prizes')}
        <FeatherIcon icon='chevron-right' className='w-4 h-4 ml-1' />
      </button>

      <MultiDrawPrizeBreakdownSheet
        drawDatas={drawDatas}
        prizeToken={prizeToken}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

MultiDrawsPrizeConfigsTrigger.defaultProps = {
  textClassName:
    'uppercase font-bold text-xxs sm:text-xs opacity-70 hover:opacity-100 transition leading-none tracking-wide'
}
