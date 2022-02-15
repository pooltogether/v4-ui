import {
  Amount,
  TokenWithBalance,
  Transaction,
  useTokenAllowance,
  useTransaction
} from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { ModalTitle, SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { useState } from 'react'
import { BigNumber } from 'ethers'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MaxUint256 } from '@ethersproject/constants'

import { GenericDepositAmountInput } from '@src/components/Input/GenericDepositAmountInput'
import { useSendTransaction } from '@src/hooks/useSendTransaction'
import { useUsersAddress } from '@src/hooks/useUsersAddress'
import { V3PrizePool } from '@src/hooks/v3/useV3PrizePools'
import { buildApproveTx } from '@src/transactions/buildApproveTx'
import { getAmountFromString } from '@src/utils/getAmountFromString'
import { AccountPageButton } from '@src/views/Deposit/DepositConfirmationModal'
import { DepositBottomButton, DepositInfoBox } from '@src/views/Deposit/DepositForm'
import { buildDepositTx } from '@src/transactions/buildV3DepositTx'
import { useUsersV3PrizePoolBalance } from '@src/hooks/v3/useUsersV3PrizePoolBalance'
import { useIsWalletOnNetwork } from '@src/hooks/useIsWalletOnNetwork'
import { ModalNetworkGate } from '@src/components/Modal/ModalNetworkGate'
import { ModalApproveGate } from '@src/views/Deposit/ModalApproveGate'
import { TransactionReceiptButton } from '@src/components/TransactionReceiptButton'
import { AmountBeingSwapped } from '@src/components/AmountBeingSwapped'
import { TxButtonNetworkGated } from '@src/components/Input/TxButtonNetworkGated'
import { ModalLoadingGate } from '@src/views/Deposit/ModalLoadingGate'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

export interface DepositViewProps {
  chainId: number
  prizePool: V3PrizePool
  setExternalDepositTxId: (number) => void
  setExternalApproveTxId: (number) => void
  onDismiss: () => void
  refetch: () => void
}

export enum DepositViews {
  'depositForm',
  'review'
}

export const PrizePoolDepositView = (props: DepositViewProps) => {
  const { chainId, prizePool, onDismiss, setExternalDepositTxId, setExternalApproveTxId, refetch } =
    props

  const usersAddress = useUsersAddress()
  const { data: prizePoolBalance, refetch: refetchPrizePoolBalances } = useUsersV3PrizePoolBalance(
    usersAddress,
    chainId,
    prizePool.addresses.prizePool,
    prizePool.addresses.ticket
  )
  const { ticket, token } = prizePoolBalance
  const {
    data: depositAllowanceUnformatted,
    isFetched: isTokenAllowanceFetched,
    refetch: refetchDepositAllowance
  } = useTokenAllowance(
    chainId,
    usersAddress,
    prizePool.addresses.prizePool,
    prizePool.addresses.token
  )

  const [depositView, setDepositView] = useState(DepositViews.depositForm)

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { watch } = form

  const [depositTxId, setInternalDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)
  const [approveTxId, setInternalApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const setDepositTxId = (txId: number) => {
    setExternalDepositTxId(txId)
    setInternalDepositTxId(txId)
  }

  const setApproveTxId = (txId: number) => {
    setExternalApproveTxId(txId)
    setInternalApproveTxId(txId)
  }

  const setReviewDepositView = () => {
    setDepositView(DepositViews.review)
  }

  const quantity = watch(DEPOSIT_QUANTITY_KEY)
  const amountToDeposit = getAmountFromString(quantity, token.decimals)

  switch (depositView) {
    case DepositViews.depositForm:
      return (
        <DepositFormView
          form={form}
          isTokenAllowanceFetched={isTokenAllowanceFetched}
          depositAllowanceUnformatted={depositAllowanceUnformatted}
          amountToDeposit={amountToDeposit}
          setReviewDepositView={setReviewDepositView}
          chainId={chainId}
          token={token}
          ticket={ticket}
          depositTx={depositTx}
        />
      )
    case DepositViews.review:
      return (
        <DepositReviewView
          chainId={chainId}
          prizePool={prizePool}
          token={token}
          ticket={ticket}
          amountToDeposit={amountToDeposit}
          depositAllowanceUnformatted={depositAllowanceUnformatted}
          approveTx={approveTx}
          depositTx={depositTx}
          onDismiss={onDismiss}
          setApproveTxId={setApproveTxId}
          setDepositTxId={setDepositTxId}
          refetch={() => {
            refetch()
            refetchDepositAllowance()
            refetchPrizePoolBalances()
          }}
        />
      )
  }
}

export interface DepositFormViewProps {
  chainId: number
  form: UseFormReturn
  depositTx: Transaction
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  depositAllowanceUnformatted: BigNumber
  isTokenAllowanceFetched: boolean
  setReviewDepositView: () => void
}

const DepositFormView = (props: DepositFormViewProps) => {
  const { chainId, ticket, token, amountToDeposit, form, depositTx, setReviewDepositView } = props

  const { t } = useTranslation()

  const { isWalletConnected } = useOnboard()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors }
  } = form

  return (
    <>
      <ModalTitle chainId={chainId} title={`${t('deposit')}: ${token.symbol}`} className='mb-4' />

      <form onSubmit={handleSubmit(setReviewDepositView)} className='w-full'>
        <div className='w-full mx-auto'>
          <GenericDepositAmountInput
            bgClassName='bg-body'
            chainId={chainId}
            form={form}
            tokenBalance={token}
            ticketBalance={ticket}
            inputKey={DEPOSIT_QUANTITY_KEY}
            isTokenBalanceFetched
          />
        </div>

        <DepositInfoBox
          className='mt-3'
          bgClassName='bg-body'
          chainId={chainId}
          depositTx={depositTx}
          errors={isDirty ? errors : null}
          amountToDeposit={amountToDeposit}
        />

        <DepositBottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          token={token}
          amountToDeposit={amountToDeposit}
          isUsersBalancesFetched
        />
      </form>
    </>
  )
}

export interface DepositReviewViewProps {
  chainId: number
  prizePool: V3PrizePool
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  depositAllowanceUnformatted: BigNumber
  approveTx: Transaction
  depositTx: Transaction
  onDismiss: () => void
  setApproveTxId: (txId: number) => void
  setDepositTxId: (txId: number) => void
  refetch: () => void
}

const DepositReviewView = (props: DepositReviewViewProps) => {
  const {
    chainId,
    prizePool,
    token,
    ticket,
    amountToDeposit,
    depositAllowanceUnformatted,
    approveTx,
    depositTx,
    onDismiss,
    setApproveTxId,
    setDepositTxId,
    refetch
  } = props

  const { t } = useTranslation()
  const { provider } = useOnboard()
  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  const sendApproveTx = async () => {
    const callTransaction = buildApproveTx(
      provider,
      MaxUint256,
      prizePool.addresses.prizePool,
      token
    )

    const name = t(`allowTickerPool`, { ticker: token.symbol })
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

  const sendDepositTx = async () => {
    const name = `${t('deposit')} ${amountToDeposit.amountPretty} ${token.symbol}`

    const callTransaction = buildDepositTx(
      provider,
      amountToDeposit.amountUnformatted,
      ticket,
      prizePool.addresses.prizePool,
      usersAddress
    )

    const txId = await sendTx({
      name,
      method: 'depositTo',
      callTransaction,
      callbacks: {
        refetch
      }
    })
    setDepositTxId(txId)
  }

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
      </>
    )
  }

  if (!depositAllowanceUnformatted) {
    return (
      <>
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </>
    )
  }

  if (amountToDeposit && depositAllowanceUnformatted?.lt(amountToDeposit.amountUnformatted)) {
    return (
      <>
        <ModalTitle chainId={chainId} title={t('approveDeposits', 'Approve deposits')} />
        <ModalApproveGate
          amountToDeposit={amountToDeposit}
          chainId={chainId}
          approveTx={approveTx}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </>
    )
  }

  if (depositTx && depositTx.sent) {
    if (depositTx.error) {
      return (
        <>
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
            onClick={onDismiss}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </>
      )
    }

    return (
      <>
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        <TransactionReceiptButton className='mt-8 w-full' chainId={chainId} tx={depositTx} />
        <AccountPageButton />
      </>
    )
  }

  return (
    <>
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
    </>
  )
}
