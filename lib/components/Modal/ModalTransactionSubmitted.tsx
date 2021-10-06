import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import React from 'react'
import Link from 'next/link'

import { ClipBoardWithCheckMark } from 'lib/components/Images/ClipBoardWithCheckMark'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
  closeModal: any
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className, closeModal } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.hash, chainId)

  return (
    <div className={classNames('flex flex-col', className)}>
      <ClipBoardWithCheckMark className='mx-auto mb-4 w-10' />

      <span className='text-sm text-accent-1 mb-8 mx-auto'>
        {t('transactionSent', 'Transaction sent')}
      </span>

      <SquareLink
        Link={Link}
        target='_blank'
        href={url}
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.md}
        className='w-full text-center'
      >
        {t('viewReceipt', 'View receipt')}
      </SquareLink>
      <SquareButton
        onClick={closeModal}
        theme={SquareButtonTheme.purpleOutline}
        size={SquareButtonSize.sm}
        className='w-full text-center mt-4'
      >
        {t('close', 'Close')}
      </SquareButton>
    </div>
  )
}
