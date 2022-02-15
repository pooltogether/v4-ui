import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import React from 'react'

import { TransactionReceiptButton } from '@components/TransactionReceiptButton'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
  closeModal: () => void
  hideCloseButton?: boolean
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className, closeModal, hideCloseButton } = props
  const { t } = useTranslation()

  return (
    <div className={classNames('flex flex-col', className)}>
      <TransactionReceiptButton className='w-full' chainId={chainId} tx={tx} />

      {!hideCloseButton && (
        <SquareButton
          onClick={() => closeModal()}
          theme={SquareButtonTheme.purpleOutline}
          size={SquareButtonSize.sm}
          className='w-full mt-4'
        >
          {t('close', 'Close')}
        </SquareButton>
      )}
    </div>
  )
}

ModalTransactionSubmitted.defaultProps = {
  hideCloseButton: false
}
