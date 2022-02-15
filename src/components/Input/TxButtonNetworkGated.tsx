import React from 'react'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import {
  SquareButton,
  SquareButtonProps,
  overrideToolTipPosition
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnNetwork } from '@src/hooks/useIsWalletOnNetwork'

export interface TxButtonNetworkGatedProps extends SquareButtonProps {
  chainId: number
  toolTipId: string
}

export const TxButtonNetworkGated = (props: TxButtonNetworkGatedProps) => {
  const { chainId, disabled, toolTipId, children, ...squareButtonProps } = props

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)

  return (
    <>
      <SquareButton
        {...squareButtonProps}
        data-tip
        data-for={`${toolTipId}-tooltip`}
        disabled={!isWalletOnProperNetwork || disabled}
        children={
          isWalletOnProperNetwork
            ? children
            : t('connectToNetwork', 'Connect to {{networkName}}', { networkName })
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
          {t('pleaseSwitchToNetwork', 'Please switch to chain {{networkName}} ({{chainId}})', {
            networkName,
            chainId
          })}
        </ReactTooltip>
      )}
    </>
  )
}
