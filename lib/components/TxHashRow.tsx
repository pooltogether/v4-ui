import React from 'react'
import { useTranslation } from 'react-i18next'
import { BlockExplorerLink } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/hooks'
import { shorten } from '@pooltogether/utilities'

interface TxHashRowProps {
  depositTx: Transaction
  chainId: number
}

export const TxHashRow = (props: TxHashRowProps) => {
  const { depositTx, chainId } = props

  const { t } = useTranslation()

  if (!depositTx) {
    return null
  }

  return (
    <div className='flex flex-row justify-between'>
      <div>{t('transactionReceipt', 'Transaction receipt')}:</div>
      <BlockExplorerLink className='text-xs' chainId={chainId} txHash={depositTx.hash}>
        <span className='underline'>{shorten({ hash: depositTx.hash })}</span>
      </BlockExplorerLink>
    </div>
  )
}
