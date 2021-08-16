import React from 'react'
import { numberWithCommas } from '@pooltogether/utilities'

import WalletIcon from 'assets/images/icon-wallet.svg'

export const MaxAmountTextInputRightLabel = (props) => {
  const { valueKey, disabled, setValue, isAmountZero, amount, tokenSymbol } = props

  if (isAmountZero) return null

  return (
    <button
      id='_setMaxDepositAmount'
      type='button'
      className='font-bold inline-flex items-center text-accent-4'
      disabled={disabled}
      onClick={(e) => {
        console.log('CLICK', amount)
        e.preventDefault()
        setValue(valueKey, amount, { shouldValidate: true })
      }}
    >
      <img src={WalletIcon} className='mr-2' style={{ maxHeight: 12 }} />
      {numberWithCommas(amount)} {tokenSymbol}
    </button>
  )
}
