import React from 'react'
import ReactTooltip from 'react-tooltip'
import {
  SquareButton,
  SquareButtonProps,
  overrideToolTipPosition
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

export interface TxButtonNetworkGatedProps extends SquareButtonProps {
  chainId: number
  toolTipId: string
}

export const TxButtonNetworkGated = (props: TxButtonNetworkGatedProps) => {
  const { chainId, disabled, toolTipId, children, ...squareButtonProps } = props

  const { network: walletChainId } = useOnboard()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(walletChainId, chainId)

  return (
    <>
      <SquareButton
        {...squareButtonProps}
        data-tip
        data-for={`${toolTipId}-tooltip`}
        disabled={!isWalletOnProperNetwork || disabled}
        children={
          isWalletOnProperNetwork ? children : `Connect to ${getNetworkNiceNameByChainId(chainId)}`
        }
      />
      {!isWalletOnProperNetwork && (
        <ReactTooltip
          id={`${toolTipId}-tooltip`}
          backgroundColor='#111'
          place='top'
          effect='solid'
          overridePosition={overrideToolTipPosition}
          clickable
        >
          Please switch to chain {chainId}
        </ReactTooltip>
      )}
    </>
  )
}
