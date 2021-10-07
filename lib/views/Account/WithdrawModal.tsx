import React, { useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import {
  Modal,
  LoadingDots,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  ErrorsBox
} from '@pooltogether/react-components'
import { Amount, Token, TokenBalance, Transaction, useTransaction } from '@pooltogether/hooks'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { DownArrow as DefaultDownArrow } from 'lib/components/DownArrow'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import {
  UsersPrizePoolBalances,
  useUsersPrizePoolBalances
} from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { PrizePoolTokens, usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { InfoList, InfoListItem } from 'lib/components/InfoList'
import { EstimatedWithdrawalGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'

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
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const { network: walletChainId } = useOnboard()

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
      setAmountToWithdraw(undefined)
      closeModal()
      setCurrentStep(WithdrawalSteps.input)
    } else {
      closeModal()
    }
  }, [currentStep])

  useEffect(() => {
    reset()
  }, [isOpen])

  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  if (!isWalletOnProperNetwork) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
        <ModalTitle chainId={prizePool.chainId} title={'Wrong network'} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
      </ModalWithStyles>
    )
  }

  if (currentStep === WithdrawalSteps.viewTxReceipt) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
        <ModalTitle chainId={prizePool.chainId} title={'Withdrawal submitted'} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={prizePool.chainId}
          tx={withdrawTx}
          closeModal={closeModal}
        />
      </ModalWithStyles>
    )
  }

  return (
    <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
      <BackButton resetForm={reset} currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <ModalTitle chainId={prizePool.chainId} title={'Withdraw tokens'} />
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
          amountToWithdraw={amountToWithdraw}
          setAmountToWithdraw={setAmountToWithdraw}
          withdrawTx={withdrawTx}
          setWithdrawTxId={setWithdrawTxId}
        />
      </div>
    </ModalWithStyles>
  )
}

const BackButton = (props) => {
  const { currentStep, setCurrentStep, resetForm } = props
  const { t } = useTranslation()

  if (currentStep === WithdrawalSteps.input || currentStep === WithdrawalSteps.viewTxReceipt)
    return null

  return (
    <button
      className='text-accent-1 absolute top-6 left-6 text-xs border-b opacity-50 hover:opacity-100 trans leading-tight'
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
  amountToWithdraw: Amount
  player: Player
  prizePool: PrizePool
  usersBalances: UsersPrizePoolBalances
  prizePoolTokens: PrizePoolTokens
  isUsersBalancesFetched: boolean
  isPrizePoolTokensFetched: boolean
  withdrawTx: Transaction
  setWithdrawTxId: (txId: number) => void
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
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
    amountToWithdraw,
    withdrawTx,
    setWithdrawTxId,
    setCurrentStep,
    setAmountToWithdraw,
    refetchUsersBalances
  } = props
  const { t } = useTranslation()

  const chainId = player.chainId

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
        amountToWithdraw={amountToWithdraw}
        token={token}
        ticket={ticket}
        tokenBalance={tokenBalance}
        ticketBalance={ticketBalance}
        setCurrentStep={setCurrentStep}
        setTxId={setWithdrawTxId}
        tx={withdrawTx}
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
      tokenBalance={tokenBalance}
      ticketBalance={ticketBalance}
      setCurrentStep={setCurrentStep}
      setAmountToWithdraw={setAmountToWithdraw}
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
  setAmountToWithdraw: (amount: Amount) => void
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props: WithdrawInputStepProps) => {
  const {
    chainId,
    form,
    token,
    ticket,
    tokenBalance,
    ticketBalance,
    setCurrentStep,
    setAmountToWithdraw
  } = props

  const { t } = useTranslation()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const amount = watch(WITHDRAWAL_QUANTITY_KEY)

  const onSubmit = (data) => {
    const amount = data[WITHDRAWAL_QUANTITY_KEY]
    setAmountToWithdraw(getAmountFromString(amount, token.decimals))
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

      <SquaredTokenAmountContainer
        chainId={chainId}
        amount={amount}
        symbol={token.symbol}
        address={token.address}
      />

      <ErrorsBox errors={isDirty ? errors : null} className='opacity-75' />

      <WithdrawWarning className='mt-2' />

      <SquareButton disabled={!isValid && isDirty} type='submit' className='w-full mt-8'>
        {t('reviewWithdrawal')}
      </SquareButton>
    </form>
  )
}

interface WithdrawReviewStepProps {
  player: Player
  prizePool: PrizePool
  chainId: number
  amountToWithdraw: Amount
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  setCurrentStep: (step: WithdrawalSteps) => void
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
    amountToWithdraw,
    token,
    ticket,
    ticketBalance,
    setCurrentStep,
    setTxId,
    refetchUsersBalances,
    tx
  } = props

  const { t } = useTranslation()

  const sendTx = useSendTransaction()

  const onClick = async (e) => {
    e.preventDefault()
    // Submit tx to wallet

    // TODO: Not really sure what withdrawal will look like.
    // Exit fee is still up in the air & might not exist.

    const tokenSymbol = token.symbol

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountToWithdraw?.amountPretty} ${tokenSymbol}`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => player.withdraw(amountToWithdraw?.amountUnformatted),
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
        amount={amountToWithdraw.amount}
        symbol={ticket.symbol}
        address={ticket.address}
      />

      <DownArrow />

      <SquaredTokenAmountContainer
        className='mb-8'
        chainId={chainId}
        amount={amountToWithdraw.amount}
        symbol={token.symbol}
        address={token.address}
      />

      <div className='my-8'>
        <UpdatedStats
          prizePool={prizePool}
          amountToWithdraw={amountToWithdraw}
          token={token}
          ticket={ticket}
          ticketBalance={ticketBalance}
        />
      </div>

      <TxButtonNetworkGated
        chainId={prizePool.chainId}
        toolTipId='withdrawal-tx'
        className='w-full'
        theme={SquareButtonTheme.orangeOutline}
        onClick={onClick}
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
      label={<WithdrawLabel symbol={ticket.symbol} />}
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

const UpdatedStats = (props) => {
  const { className, prizePool, amountToWithdraw, token, ticket, ticketBalance } = props

  return (
    <InfoList className={className}>
      <FinalTicketBalanceStat
        amount={amountToWithdraw?.amount}
        ticket={ticket}
        ticketBalance={ticketBalance}
      />
      <UnderlyingReceivedStat amount={amountToWithdraw?.amount} token={token} />
      <EstimatedWithdrawalGasItem
        prizePool={prizePool}
        amountUnformatted={amountToWithdraw?.amountUnformatted}
      />
    </InfoList>
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

  const amountPretty = numberWithCommas(amount)
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

interface ModalWithStylesProps {
  isOpen: boolean
  closeModal: () => void
  children: React.ReactNode
}

const ModalWithStyles = (props: ModalWithStylesProps) => (
  <Modal
    noSize
    noBgColor
    noPad
    className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal px-2 xs:px-8 py-10'
    label='Withdrawal Modal'
    {...props}
  />
)
