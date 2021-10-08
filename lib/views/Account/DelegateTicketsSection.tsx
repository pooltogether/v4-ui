import { TokenBalance, useTransaction } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { InfoList } from 'lib/components/InfoList'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { TxHashRow } from 'lib/components/TxHashRow'
import { usePlayer } from 'lib/hooks/Tsunami/Player/usePlayer'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useUsersTicketDelegate } from 'lib/hooks/Tsunami/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DelegateTicketsSectionProps {
  prizePool: PrizePool
  balance: TokenBalance
  className?: string
}

export const DelegateTicketsSection = (props: DelegateTicketsSectionProps) => {
  const { className, balance, prizePool } = props
  const { t } = useTranslation()

  const {
    data: usersDelegate,
    isFetched,
    refetch: refetchDelegate
  } = useUsersTicketDelegate(prizePool)

  if (
    !balance ||
    balance.amountUnformatted.isZero() ||
    !isFetched ||
    usersDelegate !== ethers.constants.AddressZero
  )
    return null

  return (
    <>
      <div className={classNames('flex mx-auto', className)}>
        <span className='text-2xl'>👋</span>
        <span className='my-auto ml-4 font-bold'>
          To win prizes with your deposits you need to activate them
        </span>
      </div>
      <ActivateTicketsButton
        className='mt-4'
        prizePool={prizePool}
        refetchDelegate={refetchDelegate}
      />
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
  const usersAddress = useUsersAddress()
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const { data: player } = usePlayer(prizePool)

  const sendDelegateTx = async (e) => {
    e.preventDefault()

    const txId = await sendTx({
      name: `Activate deposits`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => player.selfDelegateTickets(),
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
        <TxHashRow depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <TxButtonNetworkGated
      chainId={prizePool.chainId}
      toolTipId={`activate-deposits-${prizePool?.id()}`}
      className={classNames('w-full', className)}
      size={SquareButtonSize.sm}
      onClick={sendDelegateTx}
    >
      Activate tickets
    </TxButtonNetworkGated>
  )
}
