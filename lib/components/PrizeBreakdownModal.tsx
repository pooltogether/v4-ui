import { Token } from '@pooltogether/hooks'
import {
  Modal,
  ModalProps,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { PrizeDistribution } from '@pooltogether/v4-js-client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PrizeWLaurels } from './Images/PrizeWithLaurels'
import { PrizeBreakdown } from './PrizeBreakdown'

export const PrizeBreakdownModal = (
  props: { prizeDistribution: PrizeDistribution; ticket: Token } & Omit<
    ModalProps,
    'label' | 'children'
  >
) => {
  const { t } = useTranslation()
  return (
    <Modal
      className='flex flex-col'
      isOpen={props.isOpen}
      closeModal={props.closeModal}
      label='Prize breakdown modal'
    >
      <PrizeWLaurels className='mx-auto' />
      <div className='font-inter font-semibold text-sm capitalize text-white my-3 text-center'>
        {t('prizeBreakdown', 'Prize breakdown')}
      </div>

      <hr className='opacity-10 border-white w-80' />
      <PrizeBreakdown
        className='mx-auto w-full'
        prizeDistribution={props.prizeDistribution}
        ticket={props.ticket}
      />
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.md}
        className='text-center mx-auto w-3/4 mt-8'
        onClick={props.closeModal}
      >
        {t('close', 'Close')}
      </SquareButton>
    </Modal>
  )
}
