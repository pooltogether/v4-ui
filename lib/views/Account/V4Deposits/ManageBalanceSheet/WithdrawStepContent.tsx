import React from 'react'
import classnames from 'classnames'
import {
  LoadingDots,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  ErrorsBox
} from '@pooltogether/react-components'
import { Amount, TokenWithBalance, Transaction } from '@pooltogether/hooks'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { User, PrizePool } from '@pooltogether/v4-js-client'

import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { DownArrow as DefaultDownArrow } from 'lib/components/DownArrow'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { InfoListItem, ModalInfoList } from 'lib/components/InfoList'
import { EstimatedWithdrawalGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { UpdatedOdds } from 'lib/components/UpdatedOddsListItem'
import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'
import { AmountBeingSwapped } from 'lib/components/AmountBeingSwapped'
import { WithdrawalSteps } from './WithdrawView'

const WITHDRAW_QUANTITY_KEY = 'withdrawal-quantity'

interface WithdrawStepContentProps {
  form: UseFormReturn<FieldValues, object>
  currentStep: WithdrawalSteps
  user: User
  prizePool: PrizePool
  usersBalances: UsersPrizePoolBalances
  isUsersBalancesFetched: boolean
  withdrawTx: Transaction
  amountToWithdraw: Amount
  sendWithdrawTx: (e: any) => Promise<void>
  setWithdrawTxId: (txId: number) => void
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
  refetchUsersBalances: () => void
}

export const WithdrawStepContent = (props: WithdrawStepContentProps) => {
  const {
    form,
    user,
    prizePool,
    usersBalances,
    isUsersBalancesFetched,
    currentStep,
    amountToWithdraw,
    withdrawTx,
    sendWithdrawTx,
    setWithdrawTxId,
    setCurrentStep,
    setAmountToWithdraw,
    refetchUsersBalances
  } = props

  const chainId = user.chainId

  if (!isUsersBalancesFetched) {
    return (
      <div className='h-full sm:h-28 flex flex-col justify-center'>
        <LoadingDots className='mx-auto' />
      </div>
    )
  }

  const { ticket, token } = usersBalances

  if (currentStep === WithdrawalSteps.review) {
    return (
      <WithdrawReviewStep
        user={user}
        prizePool={prizePool}
        chainId={chainId}
        amountToWithdraw={amountToWithdraw}
        token={token}
        ticket={ticket}
        tx={withdrawTx}
        sendWithdrawTx={sendWithdrawTx}
        setCurrentStep={setCurrentStep}
        setTxId={setWithdrawTxId}
        refetchUsersBalances={refetchUsersBalances}
      />
    )
  }

  return (
    <WithdrawInputStep
      chainId={chainId}
      form={form}
      token={token}
      ticket={ticket}
      setCurrentStep={setCurrentStep}
      setAmountToWithdraw={setAmountToWithdraw}
    />
  )
}

interface WithdrawInputStepProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  token: TokenWithBalance
  ticket: TokenWithBalance
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props: WithdrawInputStepProps) => {
  const { chainId, form, token, ticket, setCurrentStep, setAmountToWithdraw } = props

  const { t } = useTranslation()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const amount = watch(WITHDRAW_QUANTITY_KEY)

  const onSubmit = (data) => {
    const amount = data[WITHDRAW_QUANTITY_KEY]
    setAmountToWithdraw(getAmountFromString(amount, token.decimals))
    setCurrentStep(WithdrawalSteps.review)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WithdrawForm chainId={chainId} form={form} token={token} ticket={ticket} />

      <DownArrow />

      <SquaredTokenAmountContainer chainId={chainId} amount={amount} token={token} />

      <ErrorsBox errors={isDirty ? errors : null} className='opacity-75' />

      <WithdrawWarning className='mt-2' />

      <SquareButton disabled={!isValid && isDirty} type='submit' className='w-full mt-8'>
        {t('reviewWithdrawal')}
      </SquareButton>
    </form>
  )
}

interface WithdrawReviewStepProps {
  user: User
  prizePool: PrizePool
  chainId: number
  amountToWithdraw: Amount
  token: TokenWithBalance
  ticket: TokenWithBalance
  tx: Transaction
  sendWithdrawTx: (e: any) => Promise<void>
  setCurrentStep: (step: WithdrawalSteps) => void
  setTxId: (txId: number) => void
  refetchUsersBalances: () => void
}

/**
 * The second step in the withdrawal flow.
 * The user can review their amount & send the transaction to their wallet.
 * @param {*} props
 * @returns
 */
const WithdrawReviewStep = (props: WithdrawReviewStepProps) => {
  const { prizePool, chainId, amountToWithdraw, token, ticket, tx, sendWithdrawTx } = props

  const { t } = useTranslation()

  const isTxInWallet = tx?.inWallet && !tx?.error && !tx.cancelled

  return (
    <>
      <AmountBeingSwapped
        title={t('withdrawTicker', { ticker: ticket.symbol })}
        chainId={prizePool.chainId}
        from={ticket}
        to={token}
        amount={amountToWithdraw}
      />

      <div className='my-8'>
        <UpdatedStats
          prizePool={prizePool}
          amountToWithdraw={amountToWithdraw}
          token={token}
          ticket={ticket}
        />
      </div>

      <TxButtonNetworkGated
        chainId={prizePool.chainId}
        toolTipId='withdrawal-tx'
        className='w-full'
        theme={SquareButtonTheme.orangeOutline}
        onClick={sendWithdrawTx}
        disabled={isTxInWallet}
      >
        <span>{t('confirmWithdrawal')}</span>
      </TxButtonNetworkGated>
    </>
  )
}

const WithdrawLabel = (props) => {
  const { symbol } = props
  const { t } = useTranslation()
  return (
    <div className='font-inter font-semibold uppercase text-accent-3 opacity-60'>
      {t('withdrawTicker', { ticker: symbol })}
    </div>
  )
}

interface WithdrawFormProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  token: TokenWithBalance
  ticket: TokenWithBalance
  disabled?: boolean
}

const WithdrawForm = (props: WithdrawFormProps) => {
  const { disabled, chainId, form, token, ticket } = props
  const { register, setValue } = form

  const {
    address: ticketAddress,
    symbol: ticketSymbol,
    amount,
    amountUnformatted,
    hasBalance
  } = ticket

  const withdrawValidationRules = {
    isValid: (v) => {
      if (!v) return false
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      const decimals = token.decimals
      if (getMaxPrecision(v) > Number(decimals)) return false
      const valueUnformatted = parseUnits(v, decimals)
      if (valueUnformatted.isZero()) return false
      if (valueUnformatted.lt(ethers.constants.Zero)) return false
      if (valueUnformatted.gt(amountUnformatted)) return t('insufficientFunds')
      return true
    }
  }

  const { t } = useTranslation()

  return (
    <TextInputGroup
      unsignedNumber
      readOnly={disabled}
      Input={RectangularInput}
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={ticket} />}
      validate={withdrawValidationRules}
      containerBgClassName={'bg-transparent'}
      containerRoundedClassName={'rounded-lg'}
      bgClassName={'bg-body'}
      placeholder='0.0'
      id={WITHDRAW_QUANTITY_KEY}
      name={WITHDRAW_QUANTITY_KEY}
      autoComplete='off'
      register={register}
      required={t('ticketQuantityRequired')}
      label={<WithdrawLabel symbol={ticket.symbol} />}
      rightLabel={
        <MaxAmountTextInputRightLabel
          valueKey={WITHDRAW_QUANTITY_KEY}
          setValue={setValue}
          amount={amount}
          tokenSymbol={ticketSymbol}
          isAmountZero={!hasBalance}
        />
      }
    />
  )
}

WithdrawForm.defaultProps = {
  disabled: false
}

const SquaredTokenAmountContainer = (props) => {
  const { chainId, amount, token } = props

  return (
    <TextInputGroup
      readOnly
      disabled
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={token} />}
      Input={RectangularInput}
      roundedClassName={'rounded-lg'}
      containerRoundedClassName={'rounded-lg'}
      placeholder='0.0'
      id='result'
      name='result'
      register={() => {}}
      label={null}
      value={amount}
    />
  )
}

SquaredTokenAmountContainer.defaultProps = {
  borderClassName: 'border-body'
}

const WithdrawWarning = (props) => {
  const { t } = useTranslation()

  return (
    <div
      className={classnames(
        'w-full py-1 px-4 text-xxs text-center rounded-lg bg-orange-darkened text-orange',
        props.className
      )}
    >
      {t(
        'withdrawingWillReduceYourOddsToWin',
        'Withdrawing funds will decrease your chances to win prizes!'
      )}
    </div>
  )
}

const UpdatedStats = (props: {
  className?: string
  prizePool: PrizePool
  amountToWithdraw: Amount
  token: TokenWithBalance
  ticket: TokenWithBalance
}) => {
  const { className, prizePool, amountToWithdraw, token, ticket } = props

  return (
    <ModalInfoList className={className}>
      <UpdatedOdds
        amount={amountToWithdraw}
        prizePool={prizePool}
        action={EstimateAction.withdraw}
      />
      <FinalTicketBalanceStat amount={amountToWithdraw?.amount} ticket={ticket} />
      <UnderlyingReceivedStat amount={amountToWithdraw?.amount} token={token} />
      <EstimatedWithdrawalGasItem
        chainId={prizePool.chainId}
        amountUnformatted={amountToWithdraw?.amountUnformatted}
      />
    </ModalInfoList>
  )
}

const FinalTicketBalanceStat = (props: { amount: string; ticket: TokenWithBalance }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  const amountUnformatted = ethers.utils.parseUnits(amount, ticket.decimals)
  const finalBalanceUnformatted = ticket.amountUnformatted.sub(amountUnformatted)
  const finalBalance = ethers.utils.formatUnits(finalBalanceUnformatted, ticket.decimals)
  const finalBalancePretty = numberWithCommas(finalBalance)
  const fullFinalBalancePretty = numberWithCommas(finalBalance, {
    precision: getMaxPrecision(finalBalance)
  })

  return (
    <InfoListItem
      label={t('finalDepositBalance', 'Remaining balance')}
      value={
        <Tooltip id='final-ticket-balance' tip={`${fullFinalBalancePretty} ${ticket.symbol}`}>
          <div className='flex flex-wrap justify-end'>
            <span>{finalBalancePretty}</span>
            <span className='ml-1'>{ticket.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const UnderlyingReceivedStat = (props) => {
  const { token, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount, { precision: getMaxPrecision(amount) })
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: token.symbol })}
      value={
        <Tooltip
          id={`${token.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${token.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{token.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const DownArrow = () => <DefaultDownArrow className='my-2 text-inverse' />
