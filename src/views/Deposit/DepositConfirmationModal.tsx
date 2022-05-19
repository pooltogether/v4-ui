import React from 'react'
import Link from 'next/link'
import { Amount, Token, useIsWalletOnNetwork } from '@pooltogether/hooks'
import {
  ModalProps,
  SquareButton,
  SquareLink,
  SquareButtonSize,
  SquareButtonTheme,
  ModalTitle,
  BottomSheet,
  AddTokenToMetamaskButton
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Trans, useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { msToS } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { Transaction, TransactionStatus, useWalletChainId } from '@pooltogether/wallet-connection'

import { TxButton } from '@components/Input/TxButton'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { ModalInfoList } from '@components/InfoList'
import { EstimateAction } from '@hooks/v4/Odds/useEstimatedOddsForAmount'
import { UpdatedOdds } from '@components/UpdatedOddsListItem'
import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { ModalApproveGate } from '@views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { TransactionTosDisclaimer } from '@components/TransactionTosDisclaimer'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { useSelectedChainId } from '@hooks/useSelectedChainId'

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
  } else if (amountUnformatted && depositAllowanceUnformatted?.lt(amountUnformatted)) {
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
  } else if (depositTx?.status === TransactionStatus.error) {
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
  } else if (
    depositTx?.status === TransactionStatus.pendingBlockchainConfirmation ||
    depositTx?.status === TransactionStatus.success
  ) {
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
        <AddTicketToWallet />
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
        <p className='text-center text-xs'>
          <Trans
            i18nKey='checkDailyForMoreInfoSeeHere'
            components={{
              a: (
                <a
                  href='https://docs.pooltogether.com/faq/prizes-and-winning'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-highlight-1 hover:opacity-70 transition-opacity'
                />
              )
            }}
          />
        </p>
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
                  <UpdatedOdds amount={amountToDeposit} action={EstimateAction.deposit} />
                </>
              )}
              <EstimatedDepositGasItems chainId={chainId} amountUnformatted={amountUnformatted} />
            </ModalInfoList>
          </>
        )}

        <TxButton
          className='mt-8 w-full'
          chainId={chainId}
          onClick={sendDepositTx}
          state={depositTx?.state}
          status={depositTx?.status}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButton>
        <TransactionTosDisclaimer buttonTexti18nKey='confirmDeposit' />
      </div>
    </BottomSheet>
  )
}

const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col text-center'>
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

export const AddTicketToWallet = () => {
  const { chainId: selectedChainId } = useSelectedChainId()
  const { data: ticket } = useSelectedPrizePoolTicket()
  const { t } = useTranslation()
  const isMetaMask = useIsWalletMetamask()
  const walletChainId = useWalletChainId()
  const isWalletOnProperNetwork = selectedChainId === walletChainId

  if (!isMetaMask || !isWalletOnProperNetwork) return null

  return (
    <AddTokenToMetamaskButton
      t={t}
      token={ticket}
      isMetaMask={isMetaMask}
      isWalletOnProperNetwork={isWalletOnProperNetwork}
      className='w-full'
    >
      <SquareButton theme={SquareButtonTheme.tealOutline} className='w-full'>
        {t('addTicketTokenToMetamask', {
          token: ticket.symbol
        })}
      </SquareButton>
    </AddTokenToMetamaskButton>
  )
}
