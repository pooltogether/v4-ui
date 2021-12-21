import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { BlockExplorerLink, poolToast, SquareButton } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { Token, useTransaction } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'

interface RevokeAllowanceButtonProps {
  isWalletOnProperNetwork: boolean
  depositAllowance: DepositAllowance
  isFetched: Boolean
  chainId: number
  token: Token
  callTransaction: () => Promise<TransactionResponse>
  refetch: () => {}
}

export const RevokeAllowanceButton = (props: RevokeAllowanceButtonProps) => {
  const {
    isWalletOnProperNetwork,
    token,
    chainId,
    callTransaction,
    refetch,
    depositAllowance,
    isFetched
  } = props

  const { t } = useTranslation()
  const sendTx = useSendTransaction()
  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const handleRevokeAllowanceClick = async () => {
    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t(
          'switchToNetworkToRevokeToken',
          `Switch to {{networkName}} to revoke '{{token}}' token allowance`,
          {
            networkName: getNetworkNiceNameByChainId(chainId),
            token: token.symbol
          }
        )
      )
      return null
    }

    const name = t(`revokePoolAllowance`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction,
      callbacks: {
        refetch
      }
    })

    setApproveTxId(txId)
  }

  if (!isFetched || depositAllowance.allowanceUnformatted.isZero()) {
    return null
  }

  if (approveTx?.sent && !approveTx?.cancelled) {
    return (
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex'>
        <span>
          {' '}
          {t('revokePoolAllowance', {
            ticker: token?.symbol
          })}
        </span>
        <span>
          <BlockExplorerLink shorten chainId={chainId} txHash={approveTx.hash} />
        </span>
      </div>
    )
  }

  return (
    <SquareButton
      onClick={handleRevokeAllowanceClick}
      className='flex w-full items-center justify-center'
    >
      <FeatherIcon icon='minus-circle' className='w-5 mr-1' />{' '}
      {t('revokePoolAllowance', {
        ticker: token?.symbol
      })}
    </SquareButton>
  )
}
