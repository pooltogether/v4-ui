import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import classnames from 'classnames'
import {
  Modal,
  ThemedClipSpinner,
  LoadingDots,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  formatBlockExplorerTxUrl
} from '@pooltogether/react-components'
import {
  PreTransactionDetails,
  Token,
  TokenBalance,
  Transaction,
  useTransaction
} from '@pooltogether/hooks'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { BigNumber, ethers } from 'ethers'

import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { DownArrow as DefaultDownArrow } from 'lib/components/DownArrow'
import ClipBoardCheckSvg from 'assets/images/icon-clipboard-check.svg'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { Player, PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import {
  UsersPrizePoolBalances,
  useUsersPrizePoolBalances
} from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { PrizePoolTokens, usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useChainNativeCurrency } from 'lib/hooks/useChainNativeCurrency'
import { useWithdrawGasEstimate } from 'lib/hooks/Tsunami/PrizePool/useWithdrawGasEstimate'
import { TransactionButton } from 'lib/components/Input/TransactionButton'

const WITHDRAWAL_QUANTITY_KEY = 'withdrawal-quantity'

enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawModalProps {
  isOpen: boolean
  closeModal: () => void
  player: Player
  prizePool: PrizePool
}

export const WithdrawModal = (props: WithdrawModalProps) => {
  const { isOpen, closeModal, player, prizePool } = props
  const { t } = useTranslation()

  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const [amount, setAmount] = useState<string>('')

  const {
    data: usersBalances,
    isFetched: isUsersBalancesFetched,
    refetch: refetchUsersBalances
  } = useUsersPrizePoolBalances(prizePool)

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { reset } = form

  const closeModalAndMaybeReset = useCallback(() => {
    if (currentStep === WithdrawalSteps.viewTxReceipt) {
      reset()
      setAmount(undefined)
      closeModal()
      setCurrentStep(WithdrawalSteps.input)
    } else {
      closeModal()
    }
  }, [currentStep])

  useEffect(() => {
    reset()
  }, [isOpen])

  const receiptStep = currentStep === WithdrawalSteps.viewTxReceipt

  return (
    <Modal
      noSize
      noBgColor
      isOpen={isOpen}
      className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal'
      label='withdrawal modal'
      closeModal={closeModalAndMaybeReset}
    >
      <div className='relative text-inverse px-4 py-6 h-screen sm:h-auto rounded-none sm:rounded-sm mx-auto flex flex-col'>
        <div
          className={classnames('flex flex-col justify-center items-center', {
            'pb-6': !receiptStep
          })}
        >
          <BackButton resetForm={reset} currentStep={currentStep} setCurrentStep={setCurrentStep} />

          {!receiptStep && (
            <div className='text-xl font-bold mt-8 text-white'>
              {currentStep === WithdrawalSteps.input
                ? t('withdraw')
                : t('withdrawConfirmation', 'Withdraw confirmation')}
            </div>
          )}

          <div className='w-full mx-auto mt-8'>
            <WithdrawStepContent
              form={form}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              player={player}
              prizePool={prizePool}
              usersBalances={usersBalances}
              prizePoolTokens={prizePoolTokens}
              isUsersBalancesFetched={isUsersBalancesFetched}
              isPrizePoolTokensFetched={isPrizePoolTokensFetched}
              refetchUsersBalances={refetchUsersBalances}
              amount={amount}
              setAmount={setAmount}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

const BackButton = (props) => {
  const { currentStep, setCurrentStep, resetForm } = props
  const { t } = useTranslation()

  if (currentStep === WithdrawalSteps.input || currentStep === WithdrawalSteps.viewTxReceipt)
    return null

  return (
    <button
      className='text-accent-1 absolute top-2 left-4 text-xxs border-b opacity-50 hover:opacity-100 trans'
      onClick={() => {
        const newStep = currentStep - 1
        if (newStep === WithdrawalSteps.input) {
          resetForm()
        }
        setCurrentStep(newStep)
      }}
    >
      {t('back')}
    </button>
  )
}

interface WithdrawStepContentProps {
  form: UseFormReturn<FieldValues, object>
  currentStep: WithdrawalSteps
  amount: string
  player: Player
  prizePool: PrizePool
  usersBalances: UsersPrizePoolBalances
  prizePoolTokens: PrizePoolTokens
  isUsersBalancesFetched: boolean
  isPrizePoolTokensFetched: boolean
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmount: (amount: string) => void
  refetchUsersBalances: () => void
}

const WithdrawStepContent = (props: WithdrawStepContentProps) => {
  const {
    form,
    player,
    prizePool,
    usersBalances,
    prizePoolTokens,
    isUsersBalancesFetched,
    currentStep,
    amount,
    setCurrentStep,
    setAmount,
    refetchUsersBalances
  } = props
  const { t } = useTranslation()

  const chainId = player.chainId

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const sendTx = useSendTransaction()

  if (!isUsersBalancesFetched) {
    return (
      <div className='h-full sm:h-28 flex flex-col justify-center'>
        <LoadingDots className='mx-auto' />
      </div>
    )
  }

  const { ticket: ticketBalance, token: tokenBalance } = usersBalances
  const { ticket, token } = prizePoolTokens

  if (currentStep === WithdrawalSteps.review) {
    return (
      <WithdrawReviewStep
        player={player}
        prizePool={prizePool}
        chainId={chainId}
        amount={amount}
        token={token}
        ticket={ticket}
        tokenBalance={tokenBalance}
        ticketBalance={ticketBalance}
        setCurrentStep={setCurrentStep}
        sendTx={sendTx}
        setTxId={setWithdrawTxId}
        tx={withdrawTx}
        refetchUsersBalances={refetchUsersBalances}
      />
    )
  } else if (currentStep === WithdrawalSteps.viewTxReceipt) {
    return <WithdrawReceiptStep chainId={chainId} tx={withdrawTx} />
  }

  return (
    <WithdrawInputStep
      chainId={chainId}
      form={form}
      token={token}
      ticket={ticket}
      tokenBalance={tokenBalance}
      ticketBalance={ticketBalance}
      setCurrentStep={setCurrentStep}
      setAmount={setAmount}
    />
  )
}

interface WithdrawInputStepProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmount: (amount: string) => void
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props: WithdrawInputStepProps) => {
  const { chainId, form, token, ticket, tokenBalance, ticketBalance, setCurrentStep, setAmount } =
    props

  const { t } = useTranslation()

  const {
    handleSubmit,
    formState: { isValid },
    watch
  } = form

  const amount = watch(WITHDRAWAL_QUANTITY_KEY)

  const onSubmit = (data) => {
    const amount = data[WITHDRAWAL_QUANTITY_KEY]
    setAmount(amount)
    setCurrentStep(WithdrawalSteps.review)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WithdrawForm
        chainId={chainId}
        form={form}
        token={token}
        ticket={ticket}
        tokenBalance={tokenBalance}
        ticketBalance={ticketBalance}
      />

      <DownArrow />

      <div className='mb-8'>
        <SquaredTokenAmountContainer
          chainId={chainId}
          amount={amount}
          symbol={token.symbol}
          address={token.address}
        />
      </div>

      <SquareButton disabled={!isValid} type='submit' className='w-full mb-8'>
        {t('reviewWithdrawal')}
      </SquareButton>

      <WithdrawWarning />
    </form>
  )
}

interface WithdrawReviewStepProps {
  player: Player
  prizePool: PrizePool
  chainId: number
  amount: string
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  setCurrentStep: (step: WithdrawalSteps) => void
  sendTx: (txDetails: PreTransactionDetails) => Promise<number>
  setTxId: (txId: number) => void
  tx: Transaction
  refetchUsersBalances: () => void
}

/**
 * The second step in the withdrawal flow.
 * The user can review their amount & send the transaction to their wallet.
 * @param {*} props
 * @returns
 */
const WithdrawReviewStep = (props: WithdrawReviewStepProps) => {
  const {
    player,
    prizePool,
    chainId,
    amount,
    token,
    ticket,
    ticketBalance,
    setCurrentStep,
    sendTx,
    setTxId,
    refetchUsersBalances,
    tx
  } = props

  const { t } = useTranslation()

  const onClick = async (e) => {
    e.preventDefault()
    // Submit tx to wallet

    // TODO: Not really sure what withdrawal will look like.
    // Exit fee is still up in the air & might not exist.

    const amountPretty = numberWithCommas(amount)
    const tokenSymbol = token.symbol
    const amountUnformatted = ethers.utils.parseUnits(amount, token.decimals)

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountPretty} ${tokenSymbol}`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => player.withdraw(amountUnformatted),
      callbacks: {
        onSent: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
        refetch: refetchUsersBalances
      }
    })
    setTxId(txId)
  }

  const isTxInWallet = tx?.inWallet && !tx?.error && !tx.cancelled

  return (
    <>
      <WithdrawLabel symbol={ticket.symbol} />

      <SquaredTokenAmountContainer
        chainId={chainId}
        amount={amount}
        symbol={ticket.symbol}
        address={ticket.address}
      />

      <DownArrow />

      <SquaredTokenAmountContainer
        className='mb-8'
        chainId={chainId}
        amount={amount}
        symbol={token.symbol}
        address={token.address}
      />

      <div className='my-8'>
        <UpdatedStats
          prizePool={prizePool}
          amount={amount}
          token={token}
          ticket={ticket}
          ticketBalance={ticketBalance}
        />
      </div>

      <TransactionButton
        chainId={prizePool.chainId}
        toolTipId='withdrawal-tx'
        className='w-full mb-4'
        theme={SquareButtonTheme.orange}
        onClick={onClick}
        disabled={isTxInWallet}
      >
        {isTxInWallet ? (
          <>
            <ThemedClipSpinner sizeClassName='w-3 h-3 mr-2 my-auto' />
            <span>{t('confirmWithdrawInYourWallet')}</span>
          </>
        ) : (
          <span>{t('confirmWithdrawal')}</span>
        )}
      </TransactionButton>
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

/**
 * The final step in the withdrawal flow.
 * The user can view a link transaction hash on a block explorer.
 * @param {*} props
 * @returns
 */
const WithdrawReceiptStep = (props) => {
  const { chainId, tx } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.hash, chainId)

  return (
    <div className='flex flex-col'>
      <ClipBoardCheck />
      <span className='text-xxs text-accent-1 mb-8 mx-auto'>{t('transactionSubmitted')}</span>
      <Link href={url}>
        <a className='w-full' target='_blank' rel='noreferrer'>
          <SquareButton className='w-full' theme={SquareButtonTheme.purple}>
            {t('viewReceipt', 'View receipt')}
          </SquareButton>
        </a>
      </Link>
    </div>
  )
}

interface WithdrawFormProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  disabled?: boolean
}

const WithdrawForm = (props: WithdrawFormProps) => {
  const { disabled, chainId, form, token, ticket, ticketBalance } = props
  const { register, setValue } = form

  const { address: ticketAddress, symbol: ticketSymbol } = ticket
  const { amount, amountUnformatted, hasBalance } = ticketBalance

  const withdrawValidationRules = {
    isValid: (v) => {
      // console.log('Validating', v)
      if (!v) return false
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      const decimals = token.decimals
      if (getMaxPrecision(v) > Number(decimals)) return false
      const valueUnformatted = parseUnits(v, decimals)
      if (valueUnformatted.isZero()) return false
      if (valueUnformatted.lt(ethers.constants.Zero)) return false
      if (valueUnformatted.gt(amountUnformatted)) return false
      return true
    }
  }

  const { t } = useTranslation()

  return (
    <TextInputGroup
      unsignedNumber
      readOnly={disabled}
      Input={RectangularInput}
      symbolAndIcon={
        <TokenSymbolAndIcon chainId={chainId} address={ticketAddress} symbol={ticketSymbol} />
      }
      validate={withdrawValidationRules}
      containerBgClassName={'bg-transparent'}
      containerRoundedClassName={'rounded-lg'}
      bgClassName={'bg-body'}
      placeholder='0.0'
      id={WITHDRAWAL_QUANTITY_KEY}
      name={WITHDRAWAL_QUANTITY_KEY}
      autoComplete='off'
      register={register}
      required={t('ticketQuantityRequired')}
      rightLabel={
        <MaxAmountTextInputRightLabel
          valueKey={WITHDRAWAL_QUANTITY_KEY}
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
  const { chainId, amount, symbol, address } = props

  const quantity = isNaN(amount) ? '0' : amount || '0'
  const amountFormatted = numberWithCommas(quantity, { precision: getMaxPrecision(quantity) })

  return (
    <TextInputGroup
      readOnly
      disabled
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} symbol={symbol} address={address} />}
      Input={RectangularInput}
      roundedClassName={'rounded-lg'}
      containerRoundedClassName={'rounded-lg'}
      placeholder='0.0'
      id='result'
      name='result'
      register={() => {}}
      label={null}
      value={amountFormatted}
    />
  )
}

SquaredTokenAmountContainer.defaultProps = {
  borderClassName: 'border-body'
}

const WithdrawWarning = () => {
  const { t } = useTranslation()

  return (
    <div className='w-full p-1 text-xxxs text-center rounded bg-orange-darkened text-orange mb-4'>
      {t(
        'withdrawingWillReduceYourOddsToWin',
        'Withdrawing funds will decrease your chances to win prizes!'
      )}
    </div>
  )
}

const UpdatedStats = (props) => {
  const { className, prizePool, amount, token, ticket, ticketBalance } = props

  return (
    <StatList className={className}>
      <FinalTicketBalanceStat amount={amount} ticket={ticket} ticketBalance={ticketBalance} />
      <UnderlyingReceivedStat amount={amount} token={token} />
      <EstimatedGasStat prizePool={prizePool} amount={amount} />
    </StatList>
  )
}

const StatList = (props) => {
  return (
    <ul className={classnames('rounded py-4 px-8 bg-body mb-4', props.className)}>
      {props.children}
    </ul>
  )
}

// TODO: Figure out what to actually show here
const Stat = (props) => {
  const { label, value } = props

  return (
    <li className='flex justify-between text-xxs'>
      <span className='text-accent-1'>{label}</span>
      <span className='text-right'>{value}</span>
    </li>
  )
}

const FinalTicketBalanceStat = (props) => {
  const { amount, ticket, ticketBalance } = props
  const { t } = useTranslation()
  const amountUnformatted = ethers.utils.parseUnits(amount, ticket.decimals)
  const finalBalanceUnformatted = ticketBalance.amountUnformatted.sub(amountUnformatted)
  const finalBalance = ethers.utils.formatUnits(finalBalanceUnformatted, ticket.decimals)
  const finalBalancePretty = numberWithCommas(finalBalance)
  const fullFinalBalancePretty = numberWithCommas(finalBalance, {
    precision: getMaxPrecision(finalBalance)
  })

  return (
    <Stat
      label={`${t('finalDepositBalance', 'Final deposit balance')}:`}
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

  const amountPretty = numberWithCommas(amount)
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <Stat
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

const ClipBoardCheck = () => (
  <img src={ClipBoardCheckSvg} alt='check mark icon' width={64} className='mx-auto mb-6' />
)
const DownArrow = () => <DefaultDownArrow className='my-2 text-inverse' />

interface EstimatedGasProps {
  prizePool: PrizePool
  amount: BigNumber
}

// TODO: Why are the estimate requests failing?
const EstimatedGasStat = (props: EstimatedGasProps) => {
  const { prizePool, amount } = props
  const { data: gasEstimate, isFetched } = useWithdrawGasEstimate(prizePool, amount)
  const nativeCurrency = useChainNativeCurrency(prizePool.chainId)

  if (!isFetched) {
  }

  if (!gasEstimate) {
    return (
      <Stat label='Gas estimate:' value={<span className='opacity-50'>Error estimating</span>} />
    )
  }

  return (
    <Stat
      label='Gas estimate:'
      value={<div className=''>{`${gasEstimate.toString()} ${nativeCurrency}`}</div>}
    />
  )
}
