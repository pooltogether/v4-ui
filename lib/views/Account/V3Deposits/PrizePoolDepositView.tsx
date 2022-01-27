import {
  Amount,
  TokenWithBalance,
  Transaction,
  useTransaction
} from '.yalc/@pooltogether/hooks/dist'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { BigNumber } from 'ethers'
import { GenericDepositAmountInput } from 'lib/components/Input/GenericDepositAmountInput'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { V3PrizePool } from 'lib/hooks/v3/useV3PrizePools'
import { buildApproveTx } from 'lib/transactions/buildApproveTx'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { DepositConfirmationModal } from 'lib/views/Deposit/DepositConfirmationModal'
import { DepositBottomButton, DepositInfoBox } from 'lib/views/Deposit/DepositForm'
import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MaxUint256 } from '@ethersproject/constants'
import { buildDepositTx } from 'lib/transactions/buildV3DepositTx'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

export interface DepositViewProps {
  chainId: number
  prizePool: V3PrizePool
  token: TokenWithBalance
  ticket: TokenWithBalance
  depositAllowanceUnformatted: BigNumber
  isTokenAllowanceFetched: boolean
  closeInitialSheet: () => void
  setExternalDepositTxId: (number) => void
  setExternalApproveTxId: (number) => void
  refetch: () => void
}

export enum DepositViews {
  'depositForm',
  'review'
}

// TODO: Transactions must be read directly from useTransaction isnide here
export const PrizePoolDepositView = (props: DepositViewProps) => {
  const {
    chainId,
    prizePool,
    token,
    ticket,
    depositAllowanceUnformatted,
    isTokenAllowanceFetched,
    closeInitialSheet,
    setExternalDepositTxId,
    setExternalApproveTxId,
    refetch
  } = props

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

  const setDepositFormView = () => {
    setDepositView(DepositViews.depositForm)
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
          setDepositFormView={setDepositFormView}
          closeInitialSheet={closeInitialSheet}
          setApproveTxId={setApproveTxId}
          setDepositTxId={setDepositTxId}
          refetch={refetch}
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
  setDepositFormView: () => void
  closeInitialSheet: () => void
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
    setDepositFormView,
    closeInitialSheet,
    setApproveTxId,
    setDepositTxId,
    refetch
  } = props

  const { t } = useTranslation()
  const { provider } = useOnboard()
  const sendTx = useSendTransaction()
  const [isOpen, setIsOpen] = useState(true)
  const usersAddress = useUsersAddress()

  const showConfirmModal = isOpen

  const closeDepositModal = () => {
    setDepositFormView()
    setIsOpen(false)
  }

  const onSuccess = (tx: Transaction) => {
    setDepositTxId(0)
    closeDepositModal()
    closeInitialSheet()
  }

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
    // const overrides: Overrides = { gasLimit: 750000 }

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
        onSuccess,
        refetch
      }
    })
    setDepositTxId(txId)
  }

  return (
    <DepositConfirmationModal
      chainId={chainId}
      isOpen={showConfirmModal}
      label='deposit confirmation modal'
      isDataFetched={true}
      amountToDeposit={amountToDeposit}
      depositAllowanceUnformatted={depositAllowanceUnformatted}
      resetState={() => {}}
      token={token}
      ticket={ticket}
      closeModal={closeDepositModal}
      sendApproveTx={sendApproveTx}
      sendDepositTx={sendDepositTx}
      approveTx={approveTx}
      depositTx={depositTx}
    />
  )
}
