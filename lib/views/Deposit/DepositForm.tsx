import React, { useEffect } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { ErrorsBox } from '@pooltogether/react-components'
import { TokenBalance, Transaction, Token, Amount } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'

import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { TxHashRow } from 'lib/components/TxHashRow'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { TxButtonInFlight } from 'lib/components/Input/TxButtonInFlight'
import { EstimatedDepositGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'

export const DEPOSIT_FORM_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  player: Player
  prizePool: PrizePool
  isPrizePoolFetched: boolean
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
  depositAllowance: DepositAllowance
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
    const quantity = values[DEPOSIT_FORM_KEY]
    query[DEPOSIT_FORM_KEY] = quantity
    router.replace({ pathname, query })
    setShowConfirmModal(true)
  }

  const usersAddress = useUsersAddress()

  const depositValidationRules = {
    isValid: (v) => {
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false

      const quantityUnformatted = safeParseUnits(v, decimals)

      if (isWalletConnected) {
        if (!tokenBalance) return false
        if (!ticketBalance) return false
        if (quantityUnformatted && tokenBalance.amountUnformatted.lt(quantityUnformatted))
          return t('insufficientFunds')
      }

      if (getMaxPrecision(v) > Number(decimals)) return false
      if (quantityUnformatted && quantityUnformatted.isZero()) return false
      return true
    }
  }

  // If the user input a larger amount than their wallet balance before connecting a wallet
  useEffect(() => {
    trigger(DEPOSIT_FORM_KEY)
  }, [usersAddress, ticketBalance, tokenBalance])

  return (
    <>
      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            unsignedNumber
            readOnly={depositTx?.inFlight}
            Input={RectangularInput}
            symbolAndIcon={
              <TokenSymbolAndIcon chainId={chainId} address={token.address} symbol={token.symbol} />
            }
            validate={depositValidationRules}
            containerBgClassName={'bg-transparent'}
            containerRoundedClassName={'rounded-lg'}
            bgClassName={'bg-body'}
            placeholder='0.0'
            id={DEPOSIT_FORM_KEY}
            name={DEPOSIT_FORM_KEY}
            autoComplete='off'
            register={register}
            required={t('ticketQuantityRequired')}
            rightLabel={
              <MaxAmountTextInputRightLabel
                valueKey={DEPOSIT_FORM_KEY}
                disabled={false}
                setValue={setValue}
                amount={tokenBalance?.amount}
                tokenSymbol={token.symbol}
                isAmountZero={!tokenBalance?.hasBalance}
              />
            }
            label={
              <div className='font-inter font-semibold uppercase text-accent-3 opacity-60'>
                {t('depositTicker', { ticker: token.symbol })}
              </div>
            }
          />
        </div>

        {/* <DownArrow />

        <div className='w-full mx-auto'>
          <TextInputGroup
            readOnly
            disabled
            symbolAndIcon={ticket.symbol}
            Input={RectangularInput}
            roundedClassName={'rounded-lg'}
            containerRoundedClassName={'rounded-lg'}
            bgClassName={'bg-readonly-tsunami'}
            bgVarName='var(--color-bg-readonly-tsunami)'
            placeholder='0.0'
            id='result'
            name='result'
            register={register}
            label={null}
            value={form.watch(DEPOSIT_FORM_KEY) || ''}
          />
        </div> */}

        <ErrorsBox errors={isDirty ? errors : null} />

        <BottomButton
          className='mt-2 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          tokenBalance={tokenBalance}
          token={token}
          amountToDeposit={amountToDeposit}
        />

        <DepositInfoBox
          className='mt-4'
          depositTx={depositTx}
          prizePool={prizePool}
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

interface DepositInfoProps {
  className?: string
  depositTx: Transaction
  amountToDeposit: Amount
  prizePool: PrizePool
}

export const DepositInfoBox = (props: DepositInfoProps) => {
  const { className, prizePool, amountToDeposit, depositTx } = props

  if (depositTx?.inFlight) {
    return (
      <div
        className={classNames(
          className,
          'w-full px-4 py-2 bg-light-purple-10 rounded-lg text-accent-1'
        )}
      >
        <TxHashRow depositTx={depositTx} chainId={prizePool.chainId} />
      </div>
    )
  }

  return (
    <div
      className={classNames(
        className,
        'w-full px-4 py-2 bg-light-purple-10 rounded-lg text-accent-1'
      )}
    >
      <EstimatedDepositGasItem
        prizePool={prizePool}
        amountUnformatted={amountToDeposit.amountUnformatted}
      />
    </div>
  )
}
