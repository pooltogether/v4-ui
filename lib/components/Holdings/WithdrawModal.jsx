import React, { useCallback, useEffect, useState } from 'react'
import {
  Modal,
  ThemedClipSpinner,
  LoadingDots,
  TokenIcon,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  poolToast,
  formatBlockExplorerTxUrl
} from '@pooltogether/react-components'
import {
  useOnboard,
  useSendTransaction,
  useTokenBalances,
  useTransaction,
  useUsersAddress
} from '@pooltogether/hooks'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import { useForm } from 'react-hook-form'
import { getMaxPrecision, getMinPrecision, numberWithCommas } from '@pooltogether/utilities'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
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
import Link from 'next/link'

const WITHDRAWAL_QUANTITY_KEY = 'withdrawal-quantity'

const STEPS = Object.freeze({
  input: 1,
  review: 2,
  viewTxReceipt: 3
})

export const WithdrawModal = (props) => {
  const { isOpen, closeModal } = props

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

  return (
    <Modal isOpen={isOpen} closeModal={closeModalAndMaybeReset} label='withdrawal modal'>
      <div className='pt-8'>
        <BackButton resetForm={reset} currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <WithdrawStepContent
          form={form}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          amount={amount}
          setAmount={setAmount}
        />
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
      className='text-accent-1 absolute top-2 left-4 text-xxs underline'
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

  const {
    handleSubmit,
    formState: { isDirty, isValid },
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
      <SquaredTokenAmountContainer
        className='mb-8'
        chainId={chainId}
        amount={amount}
        symbol={underlyingToken.symbol}
        address={underlyingToken.address}
      />
      <SquareButton
        disabled={!isDirty || !isValid}
        type='submit'
        className='w-full mb-8'
        theme={SquareButtonTheme.purple}
      >
        Review withdrawal
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
      <UpdatedStats amount={amount} underlyingToken={underlyingToken} ticket={ticket} />
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
            {t('viewRecepit')}
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
    <>
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
        label={<WithdrawLabel symbol={ticketSymbol} />}
      />
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

const SquaredTokenAmountContainer = (props) => {
  const { className, chainId, amount, symbol, address, borderClassName } = props

  const quantity = isNaN(amount) ? '0' : amount || '0'
  const amountFormatted = numberWithCommas(quantity, { precision: getMaxPrecision(quantity) })
  return (
    <div
      className={classNames(
        className,
        'px-8 py-4 rounded-lg trans bg-body border-2 text-lg font-inter font-semibold text-accent-1 flex justify-between',
        borderClassName
      )}
      // To match the inputs, we need to hardcode this.
      // line-height can't be set on inputs.
      style={{ lineHeight: '29.5px' }}
    >
      <TokenSymbolAndIcon chainId={chainId} symbol={symbol} address={address} />
      <span className='overflow-y-hidden overflow-x-auto text-xl ml-2'>{amountFormatted}</span>
    </div>
  )
}

SquaredTokenAmountContainer.defaultProps = {
  borderClassName: 'border-body'
}

const WithdrawWarning = () => {
  return (
    <div className='w-full p-1 text-xxxs text-center rounded bg-orange-darkened text-orange mb-4'>
      Withdrawing funds will decrease your chances to win a prize!
    </div>
  )
}

const UpdatedStats = (props) => {
  const { className, amount, underlyingToken, ticket } = props

  return (
    <ul className={classNames('rounded py-4 px-8 bg-body mb-4', className)}>
      <FinalTicketBalanceStat amount={amount} ticket={ticket} />
      <UnderlyingReceivedStat amount={amount} underlyingToken={underlyingToken} />
    </ul>
  )
}

const Stat = (props) => {
  const { label, value } = props

  return (
    <li className='flex justify-between text-xxs'>
      <span className='text-accent-1'>{label}:</span>
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
      label={'Final ticket balance'}
      value={
        <Tooltip id='Final ticket balance' tip={`${fullFinalBalancePretty} ${ticket.symbol}`}>
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
      label={`${underlyingToken.symbol} received`}
      value={
        <Tooltip
          id={`${underlyingToken.symbol} received`}
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
