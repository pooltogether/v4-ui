import React from 'react'
import { Amount, Token, Transaction } from '@pooltogether/hooks'
import {
  Tooltip,
  ModalProps,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'

import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { EstimatedDepositGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { ModalApproveGate } from 'lib/views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from 'lib/views/Deposit/ModalLoadingGate'
import { InfoListItem, ModalInfoList } from 'lib/components/InfoList'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'
import { UpdatedOdds } from 'lib/components/UpdatedOddsListItem'
import { BottomSheet } from 'lib/components/BottomSheet'
import { AmountBeingSwapped } from 'lib/components/AmountBeingSwapped'

interface DepositConfirmationModalProps extends Omit<ModalProps, 'children'> {
  chainId: number
  prizePool: PrizePool
  token: Token
  ticket: Token
  amountToDeposit: Amount
  depositAllowance: DepositAllowance
  isDataFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  sendApproveTx: () => void
  sendDepositTx: () => void
  resetState: () => void
}

export const DepositConfirmationModal = (props: DepositConfirmationModalProps) => {
  const {
    chainId,
    prizePool,
    token,
    ticket,
    amountToDeposit,
    depositAllowance,
    isDataFetched,
    approveTx,
    depositTx,
    isOpen,
    sendApproveTx,
    sendDepositTx,
    resetState,
    closeModal
  } = props

  const { amountUnformatted } = amountToDeposit

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  if (!isWalletOnProperNetwork) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </BottomSheet>
    )
  }

  if (!isDataFetched) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </BottomSheet>
    )
  }

  if (amountUnformatted && depositAllowance?.allowanceUnformatted.lt(amountUnformatted)) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('approveDeposits', 'Approve deposits')} />
        <ModalApproveGate
          chainId={chainId}
          approveTx={approveTx}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </BottomSheet>
    )
  }

  if (depositTx && depositTx.sent) {
    if (depositTx.error) {
      return (
        <BottomSheet
          label={t('confirmDepositModal', 'Confirm deposit - modal')}
          open={isOpen}
          onDismiss={closeModal}
        >
          <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
          <p className='my-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
          <p className='mb-8 text-accent-1 text-center mx-8'>
            {t(
              'somethingWentWrongWhileProcessingYourTransaction',
              'Something went wrong while processing your transaction.'
            )}
          </p>
          <SquareButton
            theme={SquareButtonTheme.tealOutline}
            className='w-full'
            onClick={() => {
              resetState()
              closeModal()
            }}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </BottomSheet>
      )
    }

    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={depositTx}
          closeModal={closeModal}
        />
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      label={t('confirmDepositModal', 'Confirm deposit - modal')}
      open={isOpen}
      onDismiss={closeModal}
    >
      <ModalTitle chainId={chainId} title={t('depositConfirmation')} />

      <div className='w-full mx-auto mt-8'>
        <AmountBeingSwapped
          title={t('depositTicker', { ticker: token.symbol })}
          chainId={chainId}
          from={token}
          to={ticket}
          amount={amountToDeposit}
        />

        <ModalInfoList className='mt-8'>
          <UpdatedOdds
            amount={amountToDeposit}
            prizePool={prizePool}
            action={EstimateAction.deposit}
          />
          <AmountToRecieve amount={amountToDeposit} ticket={ticket} />
          <EstimatedDepositGasItem chainId={chainId} amountUnformatted={amountUnformatted} />
        </ModalInfoList>

        <TxButtonNetworkGated
          className='mt-8 w-full'
          chainId={chainId}
          toolTipId={`deposit-tx-${chainId}`}
          onClick={sendDepositTx}
          disabled={depositTx?.inWallet && !depositTx.cancelled && !depositTx.completed}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButtonNetworkGated>
      </div>
    </BottomSheet>
  )
}

const AmountToRecieve = (props: { amount: Amount; ticket: Token }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  return (
    <InfoListItem
      label={
        <>
          <Tooltip
            id={`tooltip-ticket-representes-${ticket.address}`}
            tip={t(
              'ticketRepresentsChanceToWin',
              'The {{ticket}} token represents your chance to win.',
              { ticket: ticket.symbol }
            )}
          >
            {t('tickerToReceive', { ticker: ticket.symbol })}
          </Tooltip>
        </>
      }
      value={amount.amountPretty}
    />
  )
}
