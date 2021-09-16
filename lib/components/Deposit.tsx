import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import {
  BlockExplorerLink,
  ErrorsBox,
  Modal,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import {
  useUsersAddress,
  useOnboard,
  useTransaction,
  TokenBalance,
  Transaction,
  Token,
  useIsWalletOnNetwork
} from '@pooltogether/hooks'
import { getMaxPrecision, safeParseUnits, shorten } from '@pooltogether/utilities'

import { ContentPaneState, ContentPanesProps, QuantityDetails } from 'lib/components/DefaultPage'
import { FormStepper } from 'lib/components/FormStepper'
import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { MaxAmountTextInputRightLabel } from 'lib/components/MaxAmountTextInputRightLabel'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { DownArrow } from 'lib/components/DownArrow'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'

import SuccessIcon from 'assets/images/success@2x.png'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { Player, PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { TransactionButton } from 'lib/components/Input/TransactionButton'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'

export const DEPOSIT_STATES = {
  approving: 1,
  depositing: 2,
  confirming: 3,
  complete: 4
}

interface DepositProps extends ContentPanesProps {
  player: Player
  prizePool: PrizePool
  form: UseFormReturn<FieldValues, object>
  isPrizePoolFetched: boolean
  isPrizePoolTokensFetched: boolean
  isPlayerFetched: boolean
  isUsersBalancesFetched: boolean
  isUsersDepositAllowanceFetched: boolean
  token: Token
  ticket: Token
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  depositAllowance: DepositAllowance
  quantityDetails: QuantityDetails
  refetchOnApprove: () => void
  refetchOnDeposit: () => void
}

interface DepositTransactions {
  approveTx: Transaction
  depositTx: Transaction
  approveTxInFlight: boolean
  depositTxInFlight: boolean
  depositTxSuccess: string | string[]
}

export const Deposit = (props: DepositProps) => {
  const {
    player,
    form,
    token,
    depositAllowance,
    quantityDetails,
    refetchOnApprove,
    refetchOnDeposit
  } = props

  const router = useRouter()

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(
    Boolean(router.query.showConfirmModal) || false
  )

  const { t } = useTranslation()

  const sendTx = useSendTransaction()

  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const [depositTxId, setDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)

  const depositTxInFlight = !depositTx?.cancelled && !depositTx?.completed && depositTx?.sent
  const approveTxInFlight = !approveTx?.cancelled && !approveTx?.completed && approveTx?.sent

  const depositTxSuccess = router.query.success

  const { setValue } = form

  // Set quantity from the query parameter
  useEffect(() => {
    const queryQuantity = router.query.quantity
    if (queryQuantity) {
      setValue('quantity', queryQuantity, { shouldValidate: true })
    }
  }, [])

  const needsApproval =
    quantityDetails.quantityUnformatted?.gte(0) &&
    depositAllowance?.allowanceUnformatted.lte(quantityDetails.quantityUnformatted)

  const [activeStep, setActiveStep] = useState(DEPOSIT_STATES.approving)

  useEffect(() => {
    if (needsApproval) {
      setActiveStep(DEPOSIT_STATES.approving)
    } else {
      setActiveStep(DEPOSIT_STATES.depositing)
    }
  }, [needsApproval])

  useEffect(() => {
    if (showConfirmModal || depositTxInFlight) {
      setActiveStep(DEPOSIT_STATES.confirming)
    }
  }, [showConfirmModal, depositTxInFlight])

  useEffect(() => {
    if (depositTxSuccess) {
      setActiveStep(DEPOSIT_STATES.complete)
    }
  }, [depositTxSuccess])

  const closeModal = () => {
    const { query, pathname } = router
    delete query.showConfirmModal
    router.replace({ pathname, query })
    setShowConfirmModal(false)
  }

  const onDepositTxSuccess = () => {
    const { query, pathname } = router
    query.success = '1'
    router.replace({ pathname, query })
  }

  const handleApprove = async () => {
    const name = t(`allowTickerPool`, { ticker: token.symbol })

    console.log('handleApprove', player)

    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction: async () => player.approveDeposits(),
      callbacks: {
        refetch: refetchOnApprove
      }
    })
    setApproveTxId(txId)
  }

  const handleConfirmClick = async () => {
    const name = `${t('deposit')} ${quantityDetails.quantityPretty} ${token.symbol}`

    // const id = await sendTx(txName, PrizePoolAbi, poolAddress, method, params)

    const txId = await sendTx({
      name,
      method: 'depositTo',
      callTransaction: async () => {
        console.log('pre submit')
        const response = await player.depositTicket(quantityDetails.quantityUnformatted)
        console.log('post submit', response)
        return response
      },
      callbacks: {
        onSent: closeModal,
        onSuccess: onDepositTxSuccess,
        refetch: refetchOnDeposit
      }
    })
    setDepositTxId(txId)
  }

  const txs: DepositTransactions = {
    approveTx,
    depositTx,
    approveTxInFlight,
    depositTxInFlight,
    depositTxSuccess
  }

  const resetState = () => {
    const { query, pathname } = router
    delete query.success
    delete query.prevUnderlyingBalance
    delete query.prevTicketBalance
    delete query.quantity
    router.replace({ pathname, query })

    setActiveStep(DEPOSIT_STATES.depositing)
  }

  return (
    <>
      {depositTxSuccess ? (
        <SuccessPane {...props} resetState={resetState} />
      ) : (
        <>
          <ConfirmModal
            {...props}
            isOpen={showConfirmModal}
            quantityDetails={quantityDetails}
            closeModal={closeModal}
            handleConfirmClick={handleConfirmClick}
          />

          <DepositForm
            {...props}
            form={form}
            txs={txs}
            needsApproval={needsApproval}
            quantityDetails={quantityDetails}
            setShowConfirmModal={setShowConfirmModal}
            handleApprove={handleApprove}
          />
        </>
      )}

      <GradientBanner {...props} txs={txs} chainId={player?.chainId} />

      <FormStepper activeStep={activeStep} tokenSymbol={token.symbol} />
    </>
  )
}

interface SuccessPaneProps extends DepositProps {
  resetState: () => void
}

const SuccessPane = (props: SuccessPaneProps) => {
  const { resetState, token, setSelectedPage } = props

  const { t } = useTranslation()
  const router = useRouter()

  const quantity = router.query.quantity || ''

  return (
    <>
      <img src={SuccessIcon} className='h-16' />

      <p className='font-inter max-w-xs mx-auto opacity-80 text-center text-xl mt-4'>
        {t('successfullyDeposited', { amount: quantity, ticker: token.symbol })}
      </p>
      <p className='font-inter font-semibold max-w-xs mx-auto text-center text-3xl'>
        {quantity} {token.symbol}
      </p>

      <SquareButton
        className='w-full mt-10'
        theme={SquareButtonTheme.tealOutline}
        onClick={(e) => {
          e.preventDefault()
          resetState()
        }}
      >
        {t('depositMoreToIncreaseOdds', 'Deposit more to increase odds')}
      </SquareButton>
      <button
        onClick={(e) => {
          e.preventDefault()
          resetState()
          setSelectedPage(ContentPaneState.account)
        }}
        className='font-inter text-xxxs py-1 mt-1 text-center text-accent-1 hover:text-highlight-1 trans opacity-60 hover:opacity-100'
      >
        {t('viewYourAccount', 'View your account')}
      </button>
    </>
  )
}

interface DepositFormProps extends DepositProps {
  txs: DepositTransactions
  quantityDetails: QuantityDetails
  needsApproval: boolean
  setShowConfirmModal: (show: boolean) => void
  handleApprove: () => void
}

const DepositForm = (props: DepositFormProps) => {
  const {
    form,
    txs,
    needsApproval,
    token,
    ticket,
    tokenBalance,
    ticketBalance,
    quantityDetails,
    handleApprove,
    setShowConfirmModal,
    isUsersDepositAllowanceFetched
  } = props

  const [chainId] = useSelectedNetwork()

  const { depositTxInFlight, approveTxInFlight } = txs
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

  const onSubmit = (values) => {
    setReviewDeposit(values)
  }

  const setReviewDeposit = (values) => {
    const { query, pathname } = router
    const { quantity } = values

    query.quantity = quantity
    query.prevUnderlyingBalance = tokenBalance.amount
    query.prevTicketBalance = ticketBalance.amount
    query.showConfirmModal = '1'

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
    trigger('quantity')
  }, [usersAddress, ticketBalance, tokenBalance])

  return (
    <>
      <SelectedNetworkToggle className='mb-6' />
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            unsignedNumber
            readOnly={depositTxInFlight}
            Input={RectangularInput}
            symbolAndIcon={
              <TokenSymbolAndIcon chainId={chainId} address={token.address} symbol={token.symbol} />
            }
            validate={depositValidationRules}
            containerBgClassName={'bg-transparent'}
            containerRoundedClassName={'rounded-lg'}
            bgClassName={'bg-body'}
            placeholder='0.0'
            id='quantity'
            name='quantity'
            autoComplete='off'
            register={register}
            required={t('ticketQuantityRequired')}
            rightLabel={
              <MaxAmountTextInputRightLabel
                valueKey='quantity'
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

        <DownArrow />

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
            value={form.watch('quantity') || ''}
          />
        </div>

        <ErrorsBox errors={isDirty ? errors : null} />

        <DynamicBottomButton
          chainId={chainId}
          className='mt-2 w-full'
          isDepositDisabled={(!isValid && isDirty) || depositTxInFlight}
          isApproveDisabled={approveTxInFlight}
          isDepositTxInFlight={depositTxInFlight}
          isApproveTxInFlight={approveTxInFlight}
          isWalletConnected={isWalletConnected}
          needsApproval={needsApproval}
          handleApprove={handleApprove}
          usersUnderlyingBalance={tokenBalance?.amount}
          decimals={decimals}
          quantityDetails={quantityDetails}
          tokenAllowancesIsFetched={isUsersDepositAllowanceFetched}
          tokenSymbol={token.symbol}
        />
      </form>
    </>
  )
}

const DynamicBottomButton = (props) => {
  const { isWalletConnected, needsApproval } = props

  if (!isWalletConnected) {
    return <ConnectWalletButton {...props} />
  }

  if (isWalletConnected && needsApproval) {
    return <ApproveButton {...props} />
  }

  return <DepositButton {...props} />
}

const ConnectWalletButton = (props) => {
  const { className } = props
  const { connectWallet } = useOnboard()
  const { t } = useTranslation()
  return (
    <SquareButton className={className} onClick={connectWallet} type='button'>
      {t('connectWalletToDeposit')}
    </SquareButton>
  )
}

const ApproveButton = (props) => {
  const { chainId, className, tokenSymbol, isApproveTxInFlight, handleApprove, isApproveDisabled } =
    props
  const { t } = useTranslation()

  return (
    <DynamicTransactionButton
      chainId={chainId}
      disabled={isApproveDisabled}
      onClick={handleApprove}
      className={className}
      inFlight={isApproveTxInFlight}
      label={t('allowPoolTogetherToUseTicker', { ticker: tokenSymbol })}
      inFlightLabel={t('allowingPoolTogetherToUseTicker', { ticker: tokenSymbol })}
      type='button'
    />
  )
}

const DepositButton = (props) => {
  const {
    chainId,
    isWalletConnected,
    className,
    tokenSymbol,
    isDepositTxInFlight,
    isDepositDisabled,
    usersUnderlyingBalance,
    quantityDetails,
    decimals,
    tokenAllowancesIsFetched
  } = props
  const { t } = useTranslation()

  const { quantityUnformatted } = quantityDetails

  let label
  if (
    isWalletConnected &&
    usersUnderlyingBalance &&
    quantityUnformatted &&
    safeParseUnits(usersUnderlyingBalance, decimals)?.lt(quantityUnformatted)
  ) {
    label = t('insufficientTickerBalance', { ticker: tokenSymbol })
  } else if (isWalletConnected && quantityUnformatted?.isZero()) {
    label = t('enterAnAmountToDeposit')
  } else if (isWalletConnected && !tokenAllowancesIsFetched) {
    label = <ThemedClipSpinner className='mx-auto' />
  } else {
    label = t('reviewDeposit')
  }

  return (
    <DynamicTransactionButton
      chainId={chainId}
      disabled={isDepositDisabled}
      className={className}
      inFlight={isDepositTxInFlight}
      label={label}
      inFlightLabel={t('depositingAmountTicker', { ticker: tokenSymbol })}
      type='submit'
    />
  )
}

const DynamicTransactionButton = (props) => {
  const { chainId, onClick, label, inFlight, inFlightLabel, className, type, disabled } = props

  if (inFlight) {
    return (
      <SquareButton disabled onClick={onClick} type={type} className={className}>
        <ThemedClipSpinner className='mr-2' size={16} />
        {inFlightLabel}
      </SquareButton>
    )
  }

  return (
    <TransactionButton
      toolTipId={'dynamic-tx-button'}
      chainId={chainId}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
    >
      {label}
    </TransactionButton>
  )
}

interface GradientBannerProps extends DepositProps {
  txs: DepositTransactions
  chainId: number
}

const GradientBanner = (props: GradientBannerProps) => {
  const { txs, chainId } = props
  const { approveTxInFlight, depositTxInFlight, depositTx, depositTxSuccess, approveTx } = txs
  const { t } = useTranslation()

  let contents = null
  if (depositTxSuccess) {
    contents = t('disclaimerComeBackRegularlyToClaimWinnings')
  } else {
    if (depositTxInFlight) {
      contents = <TxStatus {...props} chainId={chainId} txHash={depositTx.hash} />
    } else if (approveTxInFlight) {
      contents = <TxStatus {...props} chainId={chainId} txHash={approveTx.hash} />
    } else {
      contents = t('chancesToWinAreProportional')
    }
  }

  return (
    <div className='w-full font-inter gradient-new text-center px-2 xs:px-4 py-1 mt-4 text-xxxs rounded-lg text-white'>
      {contents}
    </div>
  )
}

interface TxStatusProps extends GradientBannerProps {
  txHash: string
  chainId: number
}

const TxStatus = (props: TxStatusProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex justify-between items-center w-2/3 mx-auto'>
      <div>
        {t('status')} <span className='font-semibold'>Pending ...</span>
      </div>
      <div>
        {t('explorer')}{' '}
        <BlockExplorerLink className='text-xxxs' chainId={props.chainId} txHash={props.txHash}>
          <span className='font-semibold'>{shorten(props.txHash)}</span>
        </BlockExplorerLink>
      </div>
    </div>
  )
}

interface ConfirmModalProps extends DepositProps {
  isOpen: boolean
  closeModal: () => void
  handleConfirmClick: () => Promise<void>
}

const ConfirmModal = (props: ConfirmModalProps) => {
  const { handleConfirmClick, quantityDetails, token, ticket } = props
  const { quantity, quantityPretty } = quantityDetails

  const [chainId] = useSelectedNetwork()

  const { t } = useTranslation()

  return (
    <Modal
      noSize
      noBgColor
      isOpen={Boolean(props.isOpen)}
      className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal'
      label={`Confirm Deposit Modal`}
      closeModal={props.closeModal}
    >
      <div className='relative text-inverse px-4 py-6 h-screen sm:h-auto rounded-none sm:rounded-sm mx-auto flex flex-col'>
        <div className='flex flex-col justify-center items-center pb-6'>
          <div className='text-xl font-bold mt-8 text-white'>{t('depositConfirmation')}</div>
          <div className='w-full mx-auto mt-8'>
            <TextInputGroup
              readOnly
              disabled
              symbolAndIcon={
                <TokenSymbolAndIcon
                  chainId={chainId}
                  address={token.address}
                  symbol={token.symbol}
                />
              }
              Input={RectangularInput}
              textClassName={'text-xl text-right'}
              className={'font-inter font-semibold opacity-100'}
              containerBgClassName={'bg-body'}
              containerRoundedClassName={'rounded-lg'}
              id='quantity-confirm-modal'
              name='quantity-confirm-modal'
              register={() => {}}
              value={quantity}
            />

            <DownArrow className='text-white' />

            <TextInputGroup
              readOnly
              disabled
              symbolAndIcon={ticket.symbol}
              Input={RectangularInput}
              roundedClassName={'rounded-lg'}
              containerRoundedClassName={'rounded-lg'}
              bgVarName='var(--color-bg-readonly-tsunami)'
              id='result-confirm-modal'
              name='result-confirm-modal'
              register={() => {}}
              value={quantity}
            />

            <div className='bg-light-purple-70 text-xxs font-inter font-semibold p-5 rounded-lg mt-10 text-white'>
              <div className='flex-col'>
                {/* <div className='flex justify-between'> */}
                {/* <div className=''>{t('winningOddsPerTicker', { ticker: ticket.symbol })}</div> */}
                {/* <div className=''>{odds}</div> */}
                {/* </div> */}
                <div className='flex justify-between'>
                  <div className=''>{t('tickerToReceive', { ticker: ticket.symbol })}</div>
                  <div className=''>{quantityPretty}</div>
                </div>
              </div>
            </div>

            <TransactionButton
              className='mt-8 w-full'
              chainId={chainId}
              toolTipId={`deposit-tx-${chainId}`}
              onClick={handleConfirmClick}
            >
              {t('confirmDeposit', 'Confirm deposit')}
            </TransactionButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}
