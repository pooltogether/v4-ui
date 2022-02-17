import { SquareButton, SquareButtonProps, ThemedClipSpinner } from '@pooltogether/react-components'
import React from 'react'

export interface TxInFlightButtonProps extends SquareButtonProps {
  label: React.ReactNode
  inFlightLabel: React.ReactNode
  inFlight: boolean
}

export const TxButtonInFlight = (props: TxInFlightButtonProps) => {
  const { onClick, label, inFlight, inFlightLabel, className, type, disabled } = props

  if (inFlight) {
    return (
      <SquareButton disabled onClick={onClick} type={type} className={className}>
        <ThemedClipSpinner className='mr-2' size={16} />
        {inFlightLabel}
      </SquareButton>
    )
  }

  return (
    <SquareButton disabled={disabled} onClick={onClick} type={type} className={className}>
      {label}
    </SquareButton>
  )
}
