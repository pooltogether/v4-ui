import { Amount, TokenWithBalance, useTokenAllowance } from '@pooltogether/hooks'
import { ModalTitle, SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { useState } from 'react'
import { BigNumber } from 'ethers'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MaxUint256 } from '@ethersproject/constants'

import { GenericDepositAmountInput } from '@components/Input/GenericDepositAmountInput'
import { useSendTransaction } from '@hooks/useSendTransaction'
import {
  Transaction,
  TransactionState,
  TransactionStatus,
  useIsWalletConnected,
  useTransaction,
  useUsersAddress,
  useWalletSigner
} from '@pooltogether/wallet-connection'
import { V3PrizePool } from '@hooks/v3/useV3PrizePools'
import { buildApproveTx } from '@utils/transactions/buildApproveTx'
import { getAmountFromString } from '@utils/getAmountFromString'
import { AccountPageButton } from '@views/Deposit/DepositConfirmationModal'
import { DepositBottomButton, DepositInfoBox } from '@views/Deposit/DepositForm'
import { buildDepositTx } from '@utils/transactions/buildV3DepositTx'
import { useUsersV3PrizePoolBalance } from '@hooks/v3/useUsersV3PrizePoolBalance'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { ModalApproveGate } from '@views/Deposit/ModalApproveGate'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { TxButton } from '@components/Input/TxButton'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { useSigner } from 'wagmi'

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

  const [depositTxId, setInternalDepositTxId] = useState('')
  const depositTx = useTransaction(depositTxId)
  const [approveTxId, setInternalApproveTxId] = useState('')
  const approveTx = useTransaction(approveTxId)

  const setDepositTxId = (txId: string) => {
    setExternalDepositTxId(txId)
    setInternalDepositTxId(txId)
  }

  const setApproveTxId = (txId: string) => {
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

  const isWalletConnected = useIsWalletConnected()

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
          disabled={(!isValid && isDirty) || depositTx?.state === TransactionState.pending}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          amountToDeposit={amountToDeposit}
          chainId={chainId}
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
  setApproveTxId: (txId: string) => void
  setDepositTxId: (txId: string) => void
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
  const [, getSigner] = useSigner({
    skip: true
  })
  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()
  const isWalletOnProperNetwork = useIsWalletOnChainId(prizePool.chainId)

  const sendApproveTx = async () => {
    const signer = await getSigner()
    const callTransaction = buildApproveTx(signer, MaxUint256, prizePool.addresses.prizePool, token)

    const name = t(`allowTickerPool`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      callTransaction,
      callbacks: {
        refetch
      }
    })
    setApproveTxId(txId)
  }

  const sendDepositTx = async () => {
    const name = `${t('deposit')} ${amountToDeposit.amountPretty} ${token.symbol}`
    const signer = await getSigner()

    const callTransaction = buildDepositTx(
      signer,
      amountToDeposit.amountUnformatted,
      ticket,
      prizePool.addresses.prizePool,
      usersAddress
    )

    const txId = await sendTx({
      name,
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

  if (depositTx?.status === TransactionStatus.error) {
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
        <SquareButton theme={SquareButtonTheme.tealOutline} className='w-full' onClick={onDismiss}>
          {t('tryAgain', 'Try again')}
        </SquareButton>
      </>
    )
  } else if (depositTx?.status === TransactionStatus.success) {
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

        <TxButton
          className='mt-8 w-full'
          chainId={chainId}
          onClick={sendDepositTx}
          disabled={depositTx?.state === TransactionState.pending}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButton>
      </div>
    </>
  )
}
