import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { Amount, TokenWithBalance } from '@pooltogether/hooks'
import { User, PrizePool } from '@pooltogether/v4-client-js'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  useIsWalletConnected,
  Transaction,
  TransactionState
} from '@pooltogether/wallet-connection'
import { BigNumber } from '@ethersproject/bignumber'

import { InfoList } from '@components/InfoList'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from '@components/InfoList/EstimatedGasItem'
import { ConnectWalletButton } from '@components/ConnectWalletButton'
import { InfoListItem } from '@components/InfoList'
import { DepositAmountInput } from '@components/Input/DepositAmountInput'

import { TxButton } from '@components/Input/TxButton'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { PrizePoolAPRItem } from '@components/InfoList/PrizePoolAPRItem'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isUsersBalancesFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  openModal: () => void
}

export const DepositForm = (props: DepositFormProps) => {
  const { form, prizePool, depositTx, amountToDeposit, token, openModal } = props

  const isWalletConnected = useIsWalletConnected()
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
    openModal()
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
          chainId={prizePool.chainId}
          className='mt-3'
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          errors={isDirty ? errors : null}
          labelClassName='text-accent-1'
          valueClassName='text-inverse'
        />

        <DepositBottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.state === TransactionState.pending}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          chainId={prizePool.chainId}
          amountToDeposit={amountToDeposit}
        />
      </form>
    </>
  )
}

interface DepositBottomButtonProps {
  className?: string
  disabled: boolean
  isWalletConnected: boolean
  chainId: number
  depositTx: Transaction
  amountToDeposit: Amount
}

export const DepositBottomButton = (props: DepositBottomButtonProps) => {
  const { isWalletConnected } = props

  if (!isWalletConnected) {
    return <ConnectWalletButton {...props} />
  }

  return <DepositButton {...props} />
}

const DepositButton = (props: DepositBottomButtonProps) => {
  const { className, chainId, depositTx, disabled, amountToDeposit } = props
  const { t } = useTranslation()

  const { amountUnformatted } = amountToDeposit

  let label
  if (amountUnformatted?.isZero()) {
    label = t('enterAnAmountToDeposit')
  } else {
    label = t('reviewDeposit')
  }

  return (
    <TxButton
      disabled={disabled}
      className={className}
      state={depositTx?.state}
      status={depositTx?.status}
      type='submit'
      chainId={chainId}
    >
      {label}
    </TxButton>
  )
}

interface DepositInfoBoxProps {
  className?: string
  bgClassName?: string
  depositTx: Transaction
  chainId: number
  amountToDeposit: Amount
  depositAllowance?: BigNumber
  labelClassName?: string
  valueClassName?: string
  errors?: { [x: string]: { message: string } }
}

export const DepositInfoBox = (props: DepositInfoBoxProps) => {
  const {
    chainId,
    bgClassName,
    className,
    depositAllowance,
    amountToDeposit,
    valueClassName,
    labelClassName,
    depositTx,
    errors
  } = props

  const { t } = useTranslation()
  const prizePool = usePrizePoolBySelectedChainId()

  const errorMessages = errors ? Object.values(errors) : null
  if (
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    depositTx?.state !== TransactionState.pending
  ) {
    const messages = errorMessages.map((error) => (
      <span key={error.message} className='text-red font-semibold'>
        {error.message}
      </span>
    ))

    return (
      <InfoList bgClassName='bg-pt-purple-lighter dark:bg-pt-purple-dark' className={className}>
        <InfoListItem
          label={t('issues', 'Issues')}
          value={<div>{messages}</div>}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  if (depositTx?.state === TransactionState.pending) {
    return (
      <InfoList bgClassName={bgClassName} className={className}>
        <TxReceiptItem
          depositTx={depositTx}
          chainId={chainId}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  return (
    <InfoList bgClassName={bgClassName} className={className}>
      <PrizePoolNetworkAPRItem labelClassName={labelClassName} valueClassName={valueClassName} />
      <PrizePoolAPRItem
        prizePool={prizePool}
        labelClassName={labelClassName}
        valueClassName={valueClassName}
      />
      {depositAllowance?.gt(0) ? (
        <EstimatedDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      )}
    </InfoList>
  )
}
