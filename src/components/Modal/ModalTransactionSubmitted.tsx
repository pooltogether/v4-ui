import { Transaction } from '@pooltogether/wallet-connection'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import React from 'react'

import { TransactionReceiptButton } from '@components/TransactionReceiptButton'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className } = props

  return (
    <div className={classNames('flex flex-col', className)}>
      <FeatherIcon icon='check' className='w-16 h-16 text-pt-teal mx-auto mb-8' />
      <TransactionReceiptButton className='w-full' chainId={chainId} tx={tx} />
    </div>
  )
}
