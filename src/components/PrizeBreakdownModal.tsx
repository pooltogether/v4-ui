import { Token } from '@pooltogether/hooks'
import {
  Modal,
  ModalProps,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-client-js'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
      <div className='font-semibold text-sm capitalize text-inverse my-3 text-center'>
        {t('prizeBreakdown', 'Prize breakdown')}
      </div>

      <p className='text-accent-1 text-xs text-center'>
        <Trans
          i18nKey='prizeTierExplainer'
          components={{
            a: (
              <a
                className='text-highlight-1 hover:opacity-70 transition-opacity'
                href='https://docs.pooltogether.com/faq/prizes-and-winning'
                target='_blank'
                rel='noopener noreferrer'
              />
            )
          }}
        />
      </p>

      <hr className='opacity-10 border-pt-purple dark:border-white w-80' />
      <PrizeBreakdown
        className='mx-auto w-full'
        prizeTier={props.prizeTier}
        ticket={props.ticket}
      />
    </BottomSheet>
  )
}
