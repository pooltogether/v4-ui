import {
  formatBlockExplorerTxUrl,
  ButtonLink,
  ButtonTheme,
  ButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Transaction } from '@pooltogether/wallet-connection'

interface TransactionReceiptButtonProps {
  className?: string
  chainId: number
  tx: Transaction
}

export const TransactionReceiptButton = (props: TransactionReceiptButtonProps) => {
  const { chainId, tx, className } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.response?.hash, chainId)

  return (
    <ButtonLink
      target='_blank'
      href={url}
      theme={ButtonTheme.tealOutline}
      size={ButtonSize.md}
      className={className}
    >
      {t('viewReceipt', 'View receipt')}
    </ButtonLink>
  )
}

TransactionReceiptButton.defaultProps = {
  hideCloseButton: false
}
