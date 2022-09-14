import React from 'react'
import { numberWithCommas } from '@pooltogether/utilities'

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
        e.preventDefault()
        setValue(valueKey, amount, { shouldValidate: true })
      }}
    >
      <img src={'/icon-wallet.svg'} className='mr-2' style={{ maxHeight: 12 }} />
      {numberWithCommas(amount)} {tokenSymbol}
    </button>
  )
}
