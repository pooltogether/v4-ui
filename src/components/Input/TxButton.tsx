import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import {
  TransactionState,
  TransactionStatus,
  useConnectWallet,
  useIsWalletConnected,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import { useNetwork } from 'wagmi'

export interface TxButtonProps extends ButtonProps {
  state?: TransactionState
  status?: TransactionStatus
  connectWallet?: () => void
  chainId: number
}

/**
 *
 * @param props
 * @returns
 */
export const TxButton = (props: TxButtonProps) => {
  const {
    chainId,
    state,
    status,
    children,
    connectWallet: _connectWallet,
    onClick: _onClick,
    disabled: _disabled,
    type: _type,
    ...buttonProps
  } = props
  const isWalletConnected = useIsWalletConnected()
  const connectWallet = useConnectWallet()
  const { switchNetwork } = useNetwork()

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)
  const disabled =
    (_disabled || state === TransactionState.pending) &&
    isWalletConnected &&
    isWalletOnProperNetwork

  const [content, onClick, type] = useMemo(() => {
    if (!isWalletConnected) {
      if (!!_connectWallet) {
        return [t('connectWallet'), _connectWallet, 'button']
      }
      return [t('connectWallet'), connectWallet, 'button']
    } else if (status === TransactionStatus.pendingUserConfirmation) {
      return [t('confirmInWallet'), () => null, 'button']
    } else if (status === TransactionStatus.pendingBlockchainConfirmation) {
      return [t('transactionPending', 'Transaction pending'), () => null, 'button']
    } else if (!isWalletOnProperNetwork) {
      return [t('connectToNetwork', { networkName }), () => switchNetwork(chainId), 'button']
    } else {
      return [children, _onClick, _type]
    }
  }, [chainId, state, status, isWalletOnProperNetwork, isWalletConnected, _onClick])

  return (
    <>
      <Button
        {...buttonProps}
        onClick={(e) => onClick?.(e)}
        disabled={disabled}
        type={type as 'button' | 'submit' | 'reset'}
      >
        {content}
      </Button>
    </>
  )
}

TxButton.defaultProps = {
  type: 'button'
}
