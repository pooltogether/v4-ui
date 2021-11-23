import React, { useState } from 'react'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
import { SquareButtonSize } from '@pooltogether/react-components'
import { TokenBalance, useTransaction } from '@pooltogether/hooks'

import { InfoList } from 'lib/components/InfoList'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { TxHashRow } from 'lib/components/TxHashRow'
import { usePlayer } from 'lib/hooks/Tsunami/Player/usePlayer'
import { useUsersTicketDelegate } from 'lib/hooks/Tsunami/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

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
  )
    return null

  return (
    <>
      <div className={classNames('flex flex-col mx-auto mt-6 sm:mt-12 text-center', className)}>
        <span className='text-2xl mx-auto'>👋</span>
        <span className='my-auto font-bold'>
          {t(
            'toWinPrizesNeedToActivate',
            'To win prizes with your deposit you first need to activate it'
          )}
          :
        </span>

        <ActivateTicketsButton
          className='mt-4 w-1/2 mx-auto'
          prizePool={prizePool}
          refetchDelegate={refetchDelegate}
        />

        <span className='my-auto mt-1 opacity-70'>
          ({t('thisIsOncePerNetwork', 'This is one-time per network')})
        </span>
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
      className={classNames('', className)}
      size={SquareButtonSize.sm}
      onClick={sendDelegateTx}
    >
      {t('activateTickets', 'Activate tickets')}
    </TxButtonNetworkGated>
  )
}
