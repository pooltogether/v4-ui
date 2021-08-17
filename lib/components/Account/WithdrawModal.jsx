import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import classnames from 'classnames'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import {
  Modal,
  ThemedClipSpinner,
  LoadingDots,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  poolToast,
  formatBlockExplorerTxUrl
} from '@pooltogether/react-components'
import { useSendTransaction, useTransaction, useUsersAddress } from '@pooltogether/hooks'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { useForm } from 'react-hook-form'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'

import { usePrizePool } from 'lib/hooks/usePrizePool'
import { useUsersTokenHoldings } from 'lib/hooks/useUsersTokenHoldings'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { RectangularInput } from 'lib/components/TextInputs'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { MaxAmountTextInputRightLabel } from 'lib/components/MaxAmountTextInputRightLabel'
import { DownArrow as DefaultDownArrow } from 'lib/components/DownArrow'
import ClipBoardCheckSvg from 'assets/images/icon-clipboard-check.svg'

const WITHDRAWAL_QUANTITY_KEY = 'withdrawal-quantity'

const STEPS = Object.freeze({
  input: 1,
  review: 2,
  viewTxReceipt: 3
})

export const WithdrawModal = (props) => {
  const { isOpen, closeModal } = props
  const { t } = useTranslation()

  const [currentStep, setCurrentStep] = useState(STEPS.input)
  const [amount, setAmount] = useState()

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { reset } = form

  const closeModalAndMaybeReset = useCallback(() => {
    if (currentStep === STEPS.viewTxReceipt) {
      reset()
      setAmount(undefined)
      closeModal()
      setCurrentStep(STEPS.input)
    } else {
      closeModal()
    }
  }, [currentStep])

  useEffect(() => {
    reset()
  }, [isOpen])

  const receiptStep = currentStep === STEPS.viewTxReceipt

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
              {currentStep === STEPS.input
                ? t('withdraw')
                : t('withdrawConfirmation', 'Withdraw confirmation')}
            </div>
          )}

          <div className='w-full mx-auto mt-8'>
            <WithdrawStepContent
              form={form}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
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

  if (currentStep === STEPS.input || currentStep === STEPS.viewTxReceipt) return null

  return (
    <button
      className='text-accent-1 absolute top-2 left-4 text-xxs border-b opacity-50 hover:opacity-100 trans'
      onClick={() => {
        const newStep = currentStep - 1
        if (newStep === STEPS.input) {
          resetForm()
        }
        setCurrentStep(newStep)
      }}
    >
      {t('back')}
    </button>
  )
}

const WithdrawStepContent = (props) => {
  const { form, currentStep, setCurrentStep, amount, setAmount } = props
  const { t } = useTranslation()

  const chainId = usePoolChainId()
  const prizePool = usePrizePool()
  const {
    data: tokenBalances,
    isFetched: isTokenBalancesFetched,
    refetch
  } = useUsersTokenHoldings()

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const sendTx = useSendTransaction(t, poolToast)

  if (!isTokenBalancesFetched) {
    return (
      <div className='h-full sm:h-28 flex flex-col justify-center'>
        <LoadingDots className='mx-auto' />
      </div>
    )
  }

  const underlyingToken = tokenBalances[prizePool.tokens.underlyingToken.address]
  const ticket = tokenBalances[prizePool.tokens.ticket.address]

  if (currentStep === STEPS.review) {
    return (
      <WithdrawReviewStep
        chainId={chainId}
        amount={amount}
        prizePoolAddress={prizePool.prizePool.address}
        underlyingToken={underlyingToken}
        ticket={ticket}
        setCurrentStep={setCurrentStep}
        sendTx={sendTx}
        setTxId={setWithdrawTxId}
        tx={withdrawTx}
        refetch={refetch}
      />
    )
  } else if (currentStep === STEPS.viewTxReceipt) {
    return <WithdrawReceiptStep chainId={chainId} tx={withdrawTx} />
  }

  return (
    <WithdrawInputStep
      chainId={chainId}
      form={form}
      underlyingToken={underlyingToken}
      ticket={ticket}
      setCurrentStep={setCurrentStep}
      setAmount={setAmount}
    />
  )
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props) => {
  const { chainId, form, underlyingToken, ticket, setCurrentStep, setAmount } = props

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
    setCurrentStep(STEPS.review)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WithdrawForm
        chainId={chainId}
        form={form}
        underlyingToken={underlyingToken}
        ticket={ticket}
      />

      <DownArrow />

      <div className='mb-8'>
        <SquaredTokenAmountContainer
          chainId={chainId}
          amount={amount}
          symbol={underlyingToken.symbol}
          address={underlyingToken.address}
        />
      </div>

      <SquareButton disabled={!isValid} type='submit' className='w-full mb-8'>
        {t('reviewWithdrawal')}
      </SquareButton>

      <WithdrawWarning />
    </form>
  )
}

/**
 * The second step in the withdrawal flow.
 * The user can review their amount & send the transaction to their wallet.
 * @param {*} props
 * @returns
 */
const WithdrawReviewStep = (props) => {
  const {
    chainId,
    amount,
    underlyingToken,
    ticket,
    setCurrentStep,
    sendTx,
    setTxId,
    refetch,
    tx,
    prizePoolAddress
  } = props
  const usersAddress = useUsersAddress()

  const { t } = useTranslation()

  const onClick = async (e) => {
    e.preventDefault()
    // Submit tx to wallet

    // TODO: Not really sure what withdrawal will look like.
    // Exit fee is still up in the air & might not exist.

    const amountPretty = numberWithCommas(amount)
    const tokenSymbol = underlyingToken.symbol
    const amountUnformatted = ethers.utils.parseUnits(amount, underlyingToken.decimals)
    const ticketAddress = ticket.address

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountPretty} ${tokenSymbol}`,
      contractAbi: PrizePoolAbi,
      contractAddress: prizePoolAddress,
      method: 'withdrawInstantlyFrom',
      params: [usersAddress, amountUnformatted, ticketAddress, ethers.constants.Zero],
      callbacks: {
        onSent: () => setCurrentStep(STEPS.viewTxReceipt),
        refetch
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
        symbol={underlyingToken.symbol}
        address={underlyingToken.address}
      />

      <div className='my-8'>
        <UpdatedStats amount={amount} underlyingToken={underlyingToken} ticket={ticket} />
      </div>

      <SquareButton
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
      </SquareButton>
      {/* TODO: Test going to next step. Delete this */}
      {/* <SquareButton
        className='w-full mb-4'
        theme={SquareButtonTheme.orange}
        onClick={() => setCurrentStep(STEPS.viewTxReceipt)}
        disabled={isTxInWallet}
      >
        <span>{t('confirmWithdrawal')}</span>
      </SquareButton> */}
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

const WithdrawForm = (props) => {
  const { disabled, chainId, form, underlyingToken, ticket } = props
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
      console.log('Validating', v)
      if (!v) return false
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      const decimals = underlyingToken.decimals
      if (getMaxPrecision(v) > decimals) return false
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

const SquaredTokenAmountContainer = (props) => {
  const { chainId, amount, symbol, address } = props
  console.log({ amount })

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
  const { className, amount, underlyingToken, ticket } = props

  return (
    <StatList className={className}>
      <FinalTicketBalanceStat amount={amount} ticket={ticket} />
      <UnderlyingReceivedStat amount={amount} underlyingToken={underlyingToken} />
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
  const { underlyingToken, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount)
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <Stat
      label={t('tickerToReceive', { ticker: underlyingToken.symbol })}
      value={
        <Tooltip
          id={`${underlyingToken.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${underlyingToken.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{underlyingToken.symbol}</span>
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
