import { SquareLink, SquareButtonTheme, SquareButtonSize } from '@pooltogether/react-components'
import { formatBlockExplorerTxUrl, Transaction } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
    <SquareLink
      target='_blank'
      href={url}
      theme={SquareButtonTheme.tealOutline}
      size={SquareButtonSize.md}
      className={className}
    >
      {t('viewReceipt', 'View receipt')}
    </SquareLink>
  )
}

TransactionReceiptButton.defaultProps = {
  hideCloseButton: false
}
