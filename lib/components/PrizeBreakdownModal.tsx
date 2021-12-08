import { Token } from '@pooltogether/hooks'
import {
  Modal,
  ModalProps,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-js-client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from './BottomSheet'
import { PrizeWLaurels } from './Images/PrizeWithLaurels'
import { PrizeBreakdown } from './PrizeBreakdown'

export const PrizeBreakdownModal = (
  props: { prizeTier: PrizeTier; ticket: Token } & Omit<ModalProps, 'label' | 'children'>
) => {
  const { t } = useTranslation()
  return (
    <BottomSheet
      className='flex flex-col'
      open={props.isOpen}
      onDismiss={props.closeModal}
      label='Prize breakdown modal'
    >
      <PrizeWLaurels className='mx-auto' />
      <div className='font-inter font-semibold text-sm capitalize text-white my-3 text-center'>
        {t('prizeBreakdown', 'Prize breakdown')}
      </div>

      <hr className='opacity-10 border-white w-80' />
      <PrizeBreakdown
        className='mx-auto w-full'
        prizeTier={props.prizeTier}
        ticket={props.ticket}
      />
    </BottomSheet>
  )
}
