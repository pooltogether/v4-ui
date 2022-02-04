import React from 'react'
import Link from 'next/link'
import { Amount, Token, Transaction } from '@pooltogether/hooks'
import {
  Tooltip,
  ModalProps,
  SquareButton,
  SquareLink,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { msToS } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'

import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { EstimatedDepositGasItems } from 'lib/components/InfoList/EstimatedGasItem'
import { InfoListItem, ModalInfoList } from 'lib/components/InfoList'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { EstimateAction } from 'lib/hooks/v4/useEstimatedOddsForAmount'
import { UpdatedOdds } from 'lib/components/UpdatedOddsListItem'
import { BottomSheet } from 'lib/components/BottomSheet'
import { AmountBeingSwapped } from 'lib/components/AmountBeingSwapped'
import { TransactionReceiptButton } from 'lib/components/TransactionReceiptButton'
import { AnimatedBorderCard } from 'lib/components/AnimatedCard'
import { ModalApproveGate } from 'lib/views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from 'lib/views/Deposit/ModalLoadingGate'
import { DepositLowAmountWarning } from 'lib/views/DepositLowAmountWarning'
import { addDays } from 'lib/utils/date'
import { getTimestampString } from 'lib/utils/getTimestampString'
import { EstimatedAPRItem } from 'lib/components/InfoList/EstimatedAPRItem'

interface DepositConfirmationModalProps extends Omit<ModalProps, 'children'> {
  chainId: number
  token: Token
  ticket: Token
  amountToDeposit: Amount
  depositAllowanceUnformatted: BigNumber
  isDataFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  prizePool?: PrizePool
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
    depositAllowanceUnformatted,
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
        className='flex flex-col space-y-4'
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
        className='flex flex-col space-y-4'
      >
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </BottomSheet>
    )
  }

  if (amountUnformatted && depositAllowanceUnformatted?.lt(amountUnformatted)) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
        className='flex flex-col space-y-4'
      >
        <ModalTitle chainId={chainId} title={t('approveDeposits', 'Approve deposits')} />
        <ModalApproveGate
          amountToDeposit={amountToDeposit}
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
          className='flex flex-col space-y-4'
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
        className='flex flex-col space-y-4'
      >
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        {prizePool && <CheckBackForPrizesBox />}
        <TransactionReceiptButton className='mt-8 w-full' chainId={chainId} tx={depositTx} />
        <AccountPageButton />
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      label={t('confirmDepositModal', 'Confirm deposit - modal')}
      open={isOpen}
      onDismiss={closeModal}
      className='flex flex-col space-y-4'
    >
      <ModalTitle chainId={chainId} title={t('depositConfirmation')} />
      <div className='w-full mx-auto mt-8 space-y-8'>
        <AmountBeingSwapped
          title={t('depositTicker', { ticker: token.symbol })}
          chainId={chainId}
          from={token}
          to={ticket}
          amountFrom={amountToDeposit}
          amountTo={amountToDeposit}
        />

        {prizePool && (
          <>
            <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />

            <ModalInfoList>
              {prizePool && (
                <>
                  <EstimatedAPRItem chainId={prizePool.chainId} />
                  <UpdatedOdds
                    amount={amountToDeposit}
                    prizePool={prizePool}
                    action={EstimateAction.deposit}
                  />
                </>
              )}
              <AmountToRecieve amount={amountToDeposit} ticket={ticket} />
              <EstimatedDepositGasItems chainId={chainId} amountUnformatted={amountUnformatted} />
            </ModalInfoList>
          </>
        )}

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
      labelToolTip={t(
        'ticketRepresentsChanceToWin',
        'The {{ticket}} token represents your chance to win.',
        { ticket: ticket.symbol }
      )}
      label={t('tickerToReceive', { ticker: ticket.symbol })}
      value={amount.amountPretty}
    />
  )
}
const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col'>
      <div className='mb-2'>
        {t('disclaimerComeBackRegularlyToClaimWinnings', { date: eligibleDate })}
      </div>

      <a
        href='https://docs.pooltogether.com/faq/prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}

export const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <SquareLink
        size={SquareButtonSize.md}
        theme={SquareButtonTheme.tealOutline}
        className='w-full text-center'
      >
        {t('viewAccount', 'View account')}
      </SquareLink>
    </Link>
  )
}
