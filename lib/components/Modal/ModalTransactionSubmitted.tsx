import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'

import { ClipBoardWithCheckMark } from 'lib/components/Images/ClipBoardWithCheckMark'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.hash, chainId)

  return (
    <div className={classNames('flex flex-col', className)}>
      <ClipBoardWithCheckMark className='mx-auto mb-4 w-10' />
      <span className='text-xxs text-accent-1 mb-8 mx-auto'>
        {t('transactionSent', 'Transaction sent')}
      </span>

      <Link href={url}>
        <a className='w-full' target='_blank' rel='noreferrer'>
          <SquareButton
            className='w-full'
            theme={SquareButtonTheme.tealOutline}
            size={SquareButtonSize.sm}
          >
            {t('viewReceipt', 'View receipt')}
          </SquareButton>
        </a>
      </Link>
    </div>
  )
}
