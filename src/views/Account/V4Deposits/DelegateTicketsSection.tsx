import React, { useState } from 'react'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-client-js'
import { SquareButtonSize } from '@pooltogether/react-components'
import { TokenBalance, useTransaction } from '@pooltogether/hooks'

import { InfoList } from '@components/InfoList'
import { TxButtonNetworkGated } from '@components/Input/TxButtonNetworkGated'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { useUser } from '@hooks/v4/User/useUser'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

interface DelegateTicketsSectionProps {
  prizePool: PrizePool
  balance: TokenBalance
  className?: string
}

export const DelegateTicketsSection = (props: DelegateTicketsSectionProps) => {
  const { className, balance, prizePool } = props
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const {
    data: delegateData,
    isFetched,
    refetch: refetchDelegate
  } = useUsersTicketDelegate(usersAddress, prizePool)

  if (
    !balance ||
    balance.amountUnformatted.isZero() ||
    !isFetched ||
    delegateData?.[usersAddress] !== ethers.constants.AddressZero
  ) {
    return null
  }

  return (
    <>
      <div className={classNames('flex flex-col mx-auto text-center px-4 pb-4', className)}>
        <span className='my-auto opacity-50 px-2'>{t('toWinPrizesNeedToActivate')}</span>

        <ActivateTicketsButton
          className='mt-4 w-full mx-auto'
          prizePool={prizePool}
          refetchDelegate={refetchDelegate}
        />
      </div>
    </>
  )
}

interface ActivateTicketsButtonProps {
  prizePool: PrizePool
  refetchDelegate: () => void
  className?: string
}

const ActivateTicketsButton = (props: ActivateTicketsButtonProps) => {
  const { className, refetchDelegate, prizePool } = props
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const { t } = useTranslation()

  const user = useUser(prizePool)

  const sendDelegateTx = async (e) => {
    e.preventDefault()

    const txId = await sendTx({
      name: `Activate deposits`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => user.selfDelegateTickets(),
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  if (tx?.inFlight || (tx?.completed && !tx?.error && !tx?.cancelled)) {
    return (
      <InfoList>
        <TxReceiptItem depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <TxButtonNetworkGated
      chainId={prizePool.chainId}
      toolTipId={`activate-deposits-${prizePool?.id()}`}
      className={classNames('', className)}
      size={SquareButtonSize.sm}
      onClick={sendDelegateTx}
    >
      {t('activateNetworkDeposit', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
    </TxButtonNetworkGated>
  )
}
