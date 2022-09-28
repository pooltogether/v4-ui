import { InfoList } from '@components/InfoList'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { TxButton } from '@components/Input/TxButton'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { TokenBalance } from '@pooltogether/hooks'
import { ButtonSize } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { TransactionStatus, useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

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
    delegateData?.ticketDelegate !== ethers.constants.AddressZero
  ) {
    return null
  }

  return (
    <>
      <div className={classNames('flex flex-col mx-auto text-center px-4 pb-4', className)}>
        <span className='my-auto px-2 text-orange font-semibold'>
          {t('toWinPrizesNeedToActivate')}
        </span>

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
  const sendTransaction = useSendTransaction()
  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)

  const { t } = useTranslation()

  const getUser = useGetUser(prizePool)

  const sendDelegateTx = async (e) => {
    e.preventDefault()

    const txId = await sendTransaction({
      name: `Activate deposits`,
      callTransaction: async () => {
        const user = await getUser()
        return user.selfDelegateTickets()
      },
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  if (
    tx?.status === TransactionStatus.pendingBlockchainConfirmation ||
    tx?.status === TransactionStatus.success
  ) {
    return (
      <InfoList>
        <TxReceiptItem depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <TxButton
      chainId={prizePool.chainId}
      className={classNames('', className)}
      size={ButtonSize.sm}
      onClick={sendDelegateTx}
    >
      {t('activateNetworkDeposit', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
    </TxButton>
  )
}
