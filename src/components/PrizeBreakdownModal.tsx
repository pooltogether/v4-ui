import { Token } from '@pooltogether/hooks'
import { ModalProps, BottomSheet, ExternalLink, LinkTheme } from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-client-js'
import { Trans, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { PrizeWLaurels } from './Images/PrizeWithLaurels'
import { PrizeBreakdown } from './PrizeBreakdown'
import { ShowMoreTextButton } from './ShowMoreTextButton'

export const PrizeBreakdownModal = (
  props: { prizeTier: PrizeTier; ticket: Token } & Omit<ModalProps, 'label' | 'children'>
) => {
  const { t } = useTranslation()

  return (
    <BottomSheet
      className='flex flex-col'
      isOpen={props.isOpen}
      closeModal={props.closeModal}
      label='Prize breakdown modal'
    >
      <PrizeWLaurels className='mx-auto' />
      <div className='font-semibold text-sm capitalize text-inverse my-3 text-center'>
        {t('prizeDistribution', 'Prize distribution')}
      </div>

      <p className='text-accent-1 text-xs mb-4 text-center'>
        <Trans
          i18nKey='prizeTierExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                className='inline-block'
                href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
                theme={LinkTheme.accent}
              />
            )
          }}
        />
      </p>

      <PrizeBreakdown
        className='mx-auto w-full'
        prizeTier={props.prizeTier}
        decimals={props.ticket.decimals}
      />
    </BottomSheet>
  )
}
