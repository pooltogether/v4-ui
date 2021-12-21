import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { TokenBalance, Transaction, Token, Amount } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { User, PrizePool } from '@pooltogether/v4-js-client'
import { FieldValues, UseFormReturn } from 'react-hook-form'

import { InfoList } from 'lib/components/InfoList'
import { TxHashRow } from 'lib/components/TxHashRow'
import {
  DepositAllowance,
  useUsersDepositAllowance
} from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { TxButtonInFlight } from 'lib/components/Input/TxButtonInFlight'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from 'lib/components/InfoList/EstimatedGasItem'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { InfoListItem } from 'lib/components/InfoList'
import { DepositAmountInput } from 'lib/components/Input/DepositAmountInput'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  user: User
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isUsersBalancesFetched: boolean
  isUsersDepositAllowanceFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  token: Token
  ticket: Token
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  amountToDeposit: Amount
  setShowConfirmModal: (show: boolean) => void
}

export const DepositForm = (props: DepositFormProps) => {
  const { form, prizePool, depositTx, amountToDeposit, token, tokenBalance, setShowConfirmModal } =
    props

  const { isWalletConnected } = useOnboard()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = form

  const router = useRouter()

  const setReviewDeposit = (values) => {
    const { query, pathname } = router
    const quantity = values[DEPOSIT_QUANTITY_KEY]
    query[DEPOSIT_QUANTITY_KEY] = quantity
    router.replace({ pathname, query }, null, { scroll: false })
    setShowConfirmModal(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
        <div className='w-full mx-auto'>
          <DepositAmountInput
            prizePool={prizePool}
            className=''
            form={form}
            inputKey={DEPOSIT_QUANTITY_KEY}
          />
        </div>

        <DepositInfoBox
          className='mt-3'
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          errors={isDirty ? errors : null}
        />

        <BottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          tokenBalance={tokenBalance}
          token={token}
          amountToDeposit={amountToDeposit}
        />
      </form>
    </>
  )
}

interface BottomButtonProps {
  className?: string
  isWalletConnected: boolean
  token: Token
  depositTx: Transaction
  disabled: boolean
  tokenBalance: TokenBalance
  amountToDeposit: Amount
}

export const BottomButton = (props: BottomButtonProps) => {
  const { isWalletConnected } = props

  if (!isWalletConnected) {
    return <ConnectWalletButton {...props} />
  }

  return <DepositButton {...props} />
}

const DepositButton = (props: BottomButtonProps) => {
  const { className, token, depositTx, disabled, amountToDeposit } = props
  const { t } = useTranslation()

  const { amountUnformatted } = amountToDeposit

  let label
  if (amountUnformatted?.isZero()) {
    label = t('enterAnAmountToDeposit')
  } else {
    label = t('reviewDeposit')
  }

  return (
    <TxButtonInFlight
      disabled={disabled}
      className={className}
      inFlight={depositTx?.inFlight}
      label={label}
      inFlightLabel={t('depositingAmountTicker', { ticker: token.symbol })}
      type='submit'
    />
  )
}

interface DepositInfoBoxProps {
  className?: string
  depositTx: Transaction
  chainId: number
  amountToDeposit: Amount
  depositAllowance?: DepositAllowance
  errors?: { [x: string]: { message: string } }
}

export const DepositInfoBox = (props: DepositInfoBoxProps) => {
  const { chainId, className, depositAllowance, amountToDeposit, depositTx, errors } = props

  const { t } = useTranslation()

  const errorMessages = errors ? Object.values(errors) : null
  if (
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    !depositTx?.inFlight
  ) {
    const messages = errorMessages.map((error) => (
      <span key={error.message} className='text-red font-semibold'>
        {error.message}
      </span>
    ))

    return (
      <InfoList bgClassName='bg-pt-purple-lighter dark:bg-pt-purple-dark' className={className}>
        <InfoListItem label={t('issues', 'Issues')} value={<div>{messages}</div>} />
      </InfoList>
    )
  }

  if (depositTx?.inFlight) {
    return (
      <InfoList className={className}>
        <TxHashRow depositTx={depositTx} chainId={chainId} />
      </InfoList>
    )
  }

  return (
    <InfoList className={className}>
      {depositAllowance?.isApproved ? (
        <EstimatedDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
        />
      )}
    </InfoList>
  )
}
