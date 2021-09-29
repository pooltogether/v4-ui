import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'

import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ClipBoardWithCheckMark } from '../Images/ClipBoardWithCheckMark'

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
      <ClipBoardWithCheckMark className='mx-auto mb-4' />
      <span className='text-xxs text-accent-1 mb-8 mx-auto'>{t('transactionSubmitted')}</span>
      <Link href={url}>
        <a className='w-full' target='_blank' rel='noreferrer'>
          <SquareButton className='w-full' theme={SquareButtonTheme.purpleOutline}>
            {t('viewReceipt', 'View receipt')}
          </SquareButton>
        </a>
      </Link>
    </div>
  )
}
