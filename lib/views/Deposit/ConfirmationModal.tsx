import React from 'react'
import { Amount, Token, Transaction } from '@pooltogether/hooks'
import { Modal, ModalProps, SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'

import { DownArrow } from 'lib/components/DownArrow'
import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { EstimatedDepositGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { ModalApproveGate } from 'lib/views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from 'lib/views/Deposit/ModalLoadingGate'
import { InfoList, InfoListItem } from 'lib/components/InfoList'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'

interface ConfirmationModalProps extends ModalProps {
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

export const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {
    prizePool,
    token,
    ticket,
    amountToDeposit,
    depositAllowance,
    isDataFetched,
    approveTx,
    depositTx,
    sendApproveTx,
    sendDepositTx,
    resetState,
    isOpen,
    closeModal
  } = props
  const { amount, amountPretty, amountUnformatted } = amountToDeposit

  const [chainId] = useSelectedNetwork()
  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  if (!isWalletOnProperNetwork) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={'Wrong network'} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </ModalWithStyles>
    )
  }

  if (!isDataFetched) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={'Loading your data'} />
        <ModalLoadingGate className='mt-8' />
      </ModalWithStyles>
    )
  }

  if (!depositAllowance?.isApproved) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={'Approve deposits'} />
        <ModalApproveGate
          chainId={chainId}
          prizePool={prizePool}
          approveTx={approveTx}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </ModalWithStyles>
    )
  }

  if (depositTx && depositTx.sent) {
    if (depositTx.error) {
      return (
        <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
          <ModalTitle chainId={chainId} title={'Error depositing'} />
          <p className='my-2 text-accent-1 text-center mx-8'>😔 Oh no!</p>
          <p className='mb-8 text-accent-1 text-center mx-8'>
            Something went wrong while processing your transaction.
          </p>
          <SquareButton
            theme={SquareButtonTheme.tealOutline}
            className='w-full'
            onClick={() => {
              resetState()
              closeModal()
            }}
          >
            Try again
          </SquareButton>
        </ModalWithStyles>
      )
    }

    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={'Deposit submitted'} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={depositTx}
          closeModal={closeModal}
        />
      </ModalWithStyles>
    )
  }

  return (
    <ModalWithStyles isOpen={isOpen} closeModal={closeModal}>
      <ModalTitle chainId={prizePool.chainId} title={t('depositConfirmation')} />

      <div className='w-full mx-auto mt-8'>
        <TextInputGroup
          readOnly
          disabled
          symbolAndIcon={
            <TokenSymbolAndIcon chainId={chainId} address={token.address} symbol={token.symbol} />
          }
          Input={RectangularInput}
          textClassName={'text-xl text-right'}
          className={'font-inter font-semibold opacity-100'}
          containerBgClassName={'bg-transparent'}
          containerRoundedClassName={'rounded-lg'}
          id='quantity-confirm-modal'
          name='quantity-confirm-modal'
          register={() => {}}
          value={amount}
          label={
            <div className='font-inter font-semibold uppercase text-accent-3 opacity-60'>
              {t('depositTicker', { ticker: token.symbol })}
            </div>
          }
        />

        <DownArrow className='text-white' />

        <TextInputGroup
          readOnly
          disabled
          symbolAndIcon={ticket.symbol}
          Input={RectangularInput}
          roundedClassName={'rounded-lg'}
          containerRoundedClassName={'rounded-lg'}
          bgVarName='var(--color-bg-readonly-tsunami)'
          id='result-confirm-modal'
          name='result-confirm-modal'
          register={() => {}}
          value={amount}
        />

        <InfoList className='mt-8'>
          <AmountToRecieve amount={amountToDeposit} ticket={ticket} />
          <EstimatedDepositGasItem amountUnformatted={amountUnformatted} prizePool={prizePool} />
        </InfoList>

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
    </ModalWithStyles>
  )
}

interface ModalWithStylesProps {
  isOpen: boolean
  closeModal: () => void
  children: React.ReactNode
}

const ModalWithStyles = (props: ModalWithStylesProps) => (
  <Modal
    noSize
    noBgColor
    noPad
    className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal px-8 py-10'
    label={`Confirm Deposit Modal`}
    {...props}
  />
)

const AmountToRecieve = (props: { amount: Amount; ticket: Token }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: ticket.symbol })}
      value={amount.amountPretty}
    />
  )
}
