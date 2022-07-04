import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { Amount, TokenWithBalance } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
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
import { InfoListItem } from '@components/InfoList'
import { DepositAmountInput } from '@views/Deposit/DepositModal/DepositModalView/DepositAmountInput'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { TxButton } from '@components/Input/TxButton'
import { Button } from '@pooltogether/react-components'

export enum DEPOSIT_FORM_KEY {
  'amountToDeposit' = 'amountToDeposit'
}

export interface DepositFormValues {
  [DEPOSIT_FORM_KEY.amountToDeposit]: string
}

interface DepositFormProps {
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isUsersBalancesFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  openModal: () => void
  connectWallet: () => void
  handleSubmit: () => void
}

/**
 * @param props
 * @returns
 */
export const DepositForm = (props: DepositFormProps) => {
  const {
    prizePool,
    depositTx,
    amountToDeposit,
    token,
    openModal,
    connectWallet,
    handleSubmit: _handleSubmit
  } = props

  const isWalletConnected = useIsWalletConnected()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = useForm<DepositFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const router = useRouter()

  // TODO: Pass the data for the deposit to the next view here.
  // If the data is there on modal load then jump straight there.

  const handler = (values) => {
    _handleSubmit(values)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handler)} className='w-full'>
        <div className='w-full mx-auto'>
          <DepositAmountInput prizePool={prizePool} className='' />
        </div>

        <DepositInfoBox
          prizePool={prizePool}
          className='mt-3'
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          errors={isDirty ? errors : null}
          labelClassName='text-accent-1'
          valueClassName='text-inverse'
        />

        <DepositBottomButton
          connectWallet={connectWallet}
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
  connectWallet: () => void
  chainId: number
  depositTx: Transaction
  amountToDeposit: Amount
}

export const DepositBottomButton = (props: DepositBottomButtonProps) => {
  const { isWalletConnected, connectWallet } = props
  const { t } = useTranslation()

  if (!isWalletConnected) {
    return (
      <Button {...props} onClick={connectWallet} type='button'>
        {t('connectWallet')}
      </Button>
    )
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
  prizePool: PrizePool
  amountToDeposit: Amount
  depositAllowance?: BigNumber
  labelClassName?: string
  valueClassName?: string
  errors?: { [x: string]: { message: string } }
}

export const DepositInfoBox = (props: DepositInfoBoxProps) => {
  const {
    prizePool,
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
          chainId={prizePool.chainId}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  return (
    <InfoList bgClassName={bgClassName} className={className}>
      <EstimatedAPRItem
        prizePool={prizePool}
        labelClassName={labelClassName}
        valueClassName={valueClassName}
      />
      {depositAllowance?.gt(0) ? (
        <EstimatedDepositGasItem
          chainId={prizePool.chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          chainId={prizePool.chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      )}
    </InfoList>
  )
}
