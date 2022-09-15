import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { Transaction } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import React from 'react'
import { useTranslation } from 'next-i18next'

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

ModalTransactionSubmitted.defaultProps = {
  hideCloseButton: false
}
