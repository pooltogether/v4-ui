import { Token } from '@pooltogether/hooks'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { MultiDrawPrizeBreakdownSheet } from './MultiDrawPrizeBreakdownSheet'
import { DrawData } from '../../../interfaces/v4'

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
      <button
        className={classNames(className, textClassName, 'flex items-center')}
        onClick={() => setIsOpen(true)}
      >
        {label || t('viewPrizes', 'View prizes')}
        <FeatherIcon icon='chevron-right' className='w-4 h-4 ml-1' />
      </button>

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
    'uppercase font-bold text-xxs sm:text-xs opacity-70 hover:opacity-100 transition leading-none tracking-wide'
}
