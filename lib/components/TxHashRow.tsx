import React, { useEffect } from 'react'
import { BlockExplorerLink } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/hooks'
import { shorten } from '@pooltogether/utilities'

interface TxHashRowProps {
  depositTx: Transaction
  chainId: number
}

export const TxHashRow = (props: TxHashRowProps) => {
  const { depositTx, chainId } = props

  if (!depositTx) {
    return null
  }

  return (
    <div className='flex flex-row justify-between'>
      <div>Transaction receipt:</div>
      <BlockExplorerLink className='text-xs' chainId={chainId} txHash={depositTx.hash}>
        <span className='underline'>{shorten({ hash: depositTx.hash })}</span>
      </BlockExplorerLink>
    </div>
  )
}
