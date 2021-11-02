import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { TokenBalance, Transaction, Token, Amount } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'
import { Player, PrizePool } from '@pooltogether/v4-js-client'

import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { InfoBoxContainer } from 'lib/components/InfoBoxContainer'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { TxHashRow } from 'lib/components/TxHashRow'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { TxButtonInFlight } from 'lib/components/Input/TxButtonInFlight'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from 'lib/components/InfoList/EstimatedGasItem'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { InfoListItem } from 'lib/components/InfoList'
import { useMinimumDepositAmount } from 'lib/hooks/Tsunami/PrizePool/useMinimumDepositAmount'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  player: Player
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isPlayerFetched: boolean
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
  const {
    form,
    prizePool,
    depositTx,
    amountToDeposit,
    token,
    ticket,
    tokenBalance,
    ticketBalance,
    setShowConfirmModal
  } = props

  const { data: minimumDepositAmount, isFetched: isMinimumDepositFetched } =
    useMinimumDepositAmount(prizePool, token)

  const [chainId] = useSelectedNetwork()

  const decimals = token.decimals

  const { t } = useTranslation()

  const { isWalletConnected } = useOnboard()

  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isDirty },
    setValue,
    trigger
  } = form

  const router = useRouter()

  const setReviewDeposit = (values) => {
    const { query, pathname } = router
    const quantity = values[DEPOSIT_QUANTITY_KEY]
    query[DEPOSIT_QUANTITY_KEY] = quantity
    router.replace({ pathname, query }, null, { scroll: false })
    setShowConfirmModal(true)
  }

  const usersAddress = useUsersAddress()

  const depositValidationRules = {
    isValid: (v) => {
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      if (!isMinimumDepositFetched) return false

      const quantityUnformatted = safeParseUnits(v, decimals)

      if (isWalletConnected) {
        if (!tokenBalance) return false
        if (!ticketBalance) return false
        if (quantityUnformatted && tokenBalance.amountUnformatted.lt(quantityUnformatted))
          return t('insufficientFunds')
        if (quantityUnformatted && minimumDepositAmount.amountUnformatted.gt(quantityUnformatted))
          return t(
            'minimumDepositOfAmountRequired',
            `Minimum deposit of {{amount}} {{token}} required`,
            { amount: minimumDepositAmount.amountPretty, token: token.symbol }
          )
      }

      if (getMaxPrecision(v) > Number(decimals)) return false
      if (quantityUnformatted && quantityUnformatted.isZero()) return false
      return true
    }
  }

  // If the user input a larger amount than their wallet balance before connecting a wallet
  useEffect(() => {
    trigger(DEPOSIT_QUANTITY_KEY)
  }, [usersAddress, ticketBalance, tokenBalance])

  return (
    <>
      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            unsignedNumber
            readOnly={depositTx?.inFlight}
            Input={RectangularInput}
            symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={token} />}
            validate={depositValidationRules}
            containerBgClassName={'bg-transparent'}
            containerRoundedClassName={'rounded-lg'}
            bgClassName={'bg-primary'}
            placeholder='0.0'
            id={DEPOSIT_QUANTITY_KEY}
            name={DEPOSIT_QUANTITY_KEY}
            autoComplete='off'
            register={register}
            required={t('ticketQuantityRequired')}
            rightLabel={
              <MaxAmountTextInputRightLabel
                valueKey={DEPOSIT_QUANTITY_KEY}
                disabled={false}
                setValue={setValue}
                amount={tokenBalance?.amount}
                tokenSymbol={token.symbol}
                isAmountZero={!tokenBalance?.hasBalance}
              />
            }
            label={
              <div className='font-inter font-semibold uppercase text-accent-3 opacity-50'>
                {t('amount', 'Amount')}
              </div>
            }
          />
        </div>

        <DepositInfoBox
          className='mt-3'
          depositTx={depositTx}
          prizePool={prizePool}
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

const BottomButton = (props: BottomButtonProps) => {
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
  amountToDeposit: Amount
  prizePool: PrizePool
  errors?: { [x: string]: { message: string } }
}

export const DepositInfoBox = (props: DepositInfoBoxProps) => {
  const { className, prizePool, amountToDeposit, depositTx, errors } = props

  const { t } = useTranslation()

  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)

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
      <InfoBoxContainer bgClassName='bg-pt-purple-dark' className={className}>
        <InfoListItem label={t('issues', 'Issues')} value={<div>{messages}</div>} />
      </InfoBoxContainer>
    )
  }

  if (depositTx?.inFlight) {
    return (
      <InfoBoxContainer className={className}>
        <TxHashRow depositTx={depositTx} chainId={prizePool.chainId} />
      </InfoBoxContainer>
    )
  }

  return (
    <InfoBoxContainer className={className}>
      {depositAllowance?.isApproved ? (
        <EstimatedDepositGasItem
          prizePool={prizePool}
          amountUnformatted={amountToDeposit.amountUnformatted}
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          prizePool={prizePool}
          amountUnformatted={amountToDeposit.amountUnformatted}
        />
      )}
    </InfoBoxContainer>
  )
}
