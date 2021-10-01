import React, { useEffect } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import {
  BlockExplorerLink,
  ErrorsBox,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { TokenBalance, Transaction, Token, Amount } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { getMaxPrecision, safeParseUnits, shorten } from '@pooltogether/utilities'

import SuccessIcon from 'assets/images/success@2x.png'
import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { DownArrow } from 'lib/components/DownArrow'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { TxButtonInFlight } from 'lib/components/Input/TxButtonInFlight'
import { EstimatedDepositGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useSelectedPage, ContentPaneState } from 'lib/hooks/useSelectedPage'
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
            value={form.watch(DEPOSIT_FORM_KEY) || ''}
          />
        </div>

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

interface TxHashRowProps {
  depositTx: Transaction
  chainId: number
}

export const TxHashRow = (props: TxHashRowProps) => {
  const { depositTx, chainId } = props

  if (!depositTx) {
    return null
  }

  return (
    <div className='flex flex-row justify-between'>
      <div>Transaction receipt:</div>
      <BlockExplorerLink className='text-xs' chainId={chainId} txHash={depositTx.hash}>
        <span className='underline'>{shorten(depositTx.hash)}</span>
      </BlockExplorerLink>
    </div>
  )
}

const GradientBanner = (props) => {
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

const TxStatus = (props) => {
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

const SuccessPane = (props) => {
  const { resetState, token } = props

  const { t } = useTranslation()
  const router = useRouter()

  const { setSelectedPage } = useSelectedPage()

  const quantity = router.query[DEPOSIT_FORM_KEY] || ''

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

// export const Deposit = (props: DepositProps) => {
//   const {
//     player,
//     form,
//     token,
//     depositAllowance,
//     amountToDeposit,
//     refetchOnApprove,
//     refetchOnDeposit
//   } = props

//   const router = useRouter()

//   const [showConfirmModal, setShowConfirmModal] = useState<boolean>(
//     Boolean(router.query.showConfirmModal) || false
//   )

//   const { t } = useTranslation()

//   const sendTx = useSendTransaction()

//   const [approveTxId, setApproveTxId] = useState(0)
//   const approveTx = useTransaction(approveTxId)

//   const [depositTxId, setDepositTxId] = useState(0)
//   const depositTx = useTransaction(depositTxId)

//   const depositTxSuccess = router.query.success

//   const { setValue } = form

//   // Set quantity from the query parameter
//   useEffect(() => {
//     const queryQuantity = router.query.quantity
//     if (queryQuantity) {
//       setValue('quantity', queryQuantity, { shouldValidate: true })
//     }
//   }, [])

//   const needsApproval =
//     amountToDeposit.amountUnformatted?.gte(0) &&
//     depositAllowance?.allowanceUnformatted.lte(amountToDeposit.amountUnformatted)

//   const [activeStep, setActiveStep] = useState(DEPOSIT_STATES.approving)

//   useEffect(() => {
//     if (needsApproval) {
//       setActiveStep(DEPOSIT_STATES.approving)
//     } else {
//       setActiveStep(DEPOSIT_STATES.depositing)
//     }
//   }, [needsApproval])

//   useEffect(() => {
//     if (showConfirmModal || depositTx?.inFlight) {
//       setActiveStep(DEPOSIT_STATES.confirming)
//     }
//   }, [showConfirmModal, depositTxInFlight])

//   useEffect(() => {
//     if (depositTxSuccess) {
//       setActiveStep(DEPOSIT_STATES.complete)
//     }
//   }, [depositTxSuccess])

//   const closeModal = () => {
//     const { query, pathname } = router
//     delete query.showConfirmModal
//     router.replace({ pathname, query })
//     setShowConfirmModal(false)
//   }

//   const handleApprove = async () => {
//     const name = t(`allowTickerPool`, { ticker: token.symbol })

//     console.log('handleApprove', player)

//     const txId = await sendTx({
//       name,
//       method: 'approve',
//       callTransaction: async () => player.approveDeposits(),
//       callbacks: {
//         refetch: refetchOnApprove
//       }
//     })
//     setApproveTxId(txId)
//   }

//   const handleConfirmClick = async () => {
//     const name = `${t('deposit')} ${quantityDetails.quantityPretty} ${token.symbol}`

//     const txId = await sendTx({
//       name,
//       method: 'depositTo',
//       callTransaction: async () => {
//         console.log('pre submit')
//         const response = await player.deposit(quantityDetails.quantityUnformatted)
//         console.log('post submit', response)
//         return response
//       },
//       callbacks: {
//         onSent: closeModal,
//         refetch: refetchOnDeposit
//       }
//     })
//     setDepositTxId(txId)
//   }

//   return (
//     <>
//       {depositTxSuccess ? (
//         <SuccessPane {...props} resetState={resetState} />
//       ) : (
//         <>
//           <ConfirmationModal
//             {...props}
//             isOpen={showConfirmModal}
//             quantityDetails={quantityDetails}
//             closeModal={closeModal}
//             handleConfirmClick={handleConfirmClick}
//           />

//           <DepositForm
//             {...props}
//             form={form}
//             txs={txs}
//             needsApproval={needsApproval}
//             quantityDetails={quantityDetails}
//             setShowConfirmModal={setShowConfirmModal}
//             handleApprove={handleApprove}
//           />
//         </>
//       )}

//       <GradientBanner {...props} txs={txs} chainId={player?.chainId} />
//     </>
//   )
// }
