import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { parseUnits } from '@ethersproject/units'
import {
  BlockExplorerLink,
  ErrorsBox,
  Modal,
  ThemedClipSpinner,
  poolToast
} from '@pooltogether/react-components'
// import { TsunamiInput, TextInputGroup } from '@pooltogether/react-components'
import {
  useUsersAddress,
  useOnboard,
  useTransaction,
  useSendTransaction
} from '@pooltogether/hooks'
import { getMaxPrecision, numberWithCommas, shorten } from '@pooltogether/utilities'
import ControlledTokenAbi from '@pooltogether/pooltogether-contracts/abis/ControlledToken'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'

import { FormStepper } from 'lib/components/FormStepper'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { TsunamiInput } from 'lib/components/TextInputs'
import { CurrencyIcon } from 'lib/components/CurrencyIcon'
// import { ErrorsBox } from 'lib/components/'

import WalletIcon from 'assets/images/icon-wallet.svg'

export const DEPOSIT_STATES = {
  approving: 1,
  depositing: 2,
  confirming: 3,
  complete: 4
}

export const DepositAmount = (props) => {
  const {
    underlyingToken,
    usersUnderlyingBalance,
    usersTicketBalance,
    usersTokenAllowance,
    tokenAllowancesIsFetched,
    tokenAllowancesRefetch,
    tokenSymbol,
    tokenAddress,
    ticketAddress,
    contractAddress,
    // nextStep,
    quantity: queryQuantity,
    chainId,
    form
  } = props

  const router = useRouter()

  const { isWalletConnected, connectWallet } = useOnboard()
  const usersAddress = useUsersAddress()

  const [showConfirmModal, setShowConfirmModal] = useState(router.query.showConfirmModal, false)

  const { t } = useTranslation()

  const sendTx = useSendTransaction(t, poolToast)

  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const [depositTxId, setDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)

  const depositTxInFlight = !depositTx?.cancelled && !depositTx?.completed && depositTx?.sent
  const approveTxInFlight = !approveTx?.cancelled && !approveTx?.completed && approveTx?.sent

  const depositTxSuccess = router.query.success

  const { handleSubmit, register, formState, setValue } = form
  const { errors } = formState

  const quantity = form.watch('quantity') || '0'
  const quantityBN = parseUnits(quantity, underlyingToken.decimals)
  const quantityFormatted = numberWithCommas(quantity)

  const needsApproval = quantityBN.gte(0) && usersTokenAllowance?.lte(quantityBN)

  // Set quantity from the query parameter
  useEffect(() => {
    if (queryQuantity) {
      setValue('quantity', queryQuantity, { shouldValidate: true })
    }
  }, [])

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

  const [activeStep, setActiveStep] = useState(DEPOSIT_STATES.approving)

  const onSubmit = (values) => {
    // for some reason the form is always invalid? Need to debug why
    // if (formState.isValid) {
    console.log('wtf')
    console.log(values.quantity)
    setReviewDeposit(values)
    // }
  }

  // const setReviewDeposit = (values) => {
  const setReviewDeposit = (quantity) => {
    const { query, pathname } = router

    query.quantity = quantity
    // query.quantity = values.quantity
    query.prevUnderlyingBalance = usersUnderlyingBalance
    query.prevTicketBalance = usersTicketBalance
    query.showConfirmModal = '1'

    router.replace({ pathname, query })
    setShowConfirmModal(true)
  }

  const depositButtonLabel = () => {
    const approvingMsg = <>{t('allowPoolTogetherToUseTicker', { ticker: tokenSymbol })}</>
    const approveTxInFlightMsg = (
      <>
        <ThemedClipSpinner className='mr-2' size={16} />
        {t('allowingPoolTogetherToUseTicker', { ticker: tokenSymbol })}
      </>
    )

    const depositTxInFlightMsg = (
      <>
        <ThemedClipSpinner className='mr-2' size={16} />
        {t('depositingAmountTicker', { amount: quantityFormatted, ticker: tokenSymbol })}
      </>
    )

    if (depositTxInFlight) return depositTxInFlightMsg
    if (approveTxInFlight) return approveTxInFlightMsg

    if (
      usersUnderlyingBalance &&
      parseUnits(usersUnderlyingBalance).lt(parseUnits(quantity, underlyingToken.decimals))
    )
      return t('insufficientTickerBalance', { ticker: tokenSymbol })

    if (isWalletConnected && quantityBN.isZero()) return t('enterAnAmountToDeposit')
    if (isWalletConnected && needsApproval) return approvingMsg
    if (isWalletConnected && !tokenAllowancesIsFetched) return <ThemedClipSpinner />
    if (!isWalletConnected) return t('connectWalletToDeposit')
    if (isWalletConnected && !needsApproval) return t('reviewDeposit')

    return '...'
  }

  const handleApprove = async (e) => {
    const params = [
      contractAddress,
      ethers.utils.parseUnits('9999999999', Number(underlyingToken.decimals))
    ]

    const name = t(`allowTickerPool`, { ticker: tokenSymbol })

    const txId = await sendTx({
      name,
      contractAbi: ControlledTokenAbi,
      contractAddress: tokenAddress,
      method: 'approve',
      params,
      callbacks: {
        refetch: tokenAllowancesRefetch
      }
    })
    setApproveTxId(txId)
  }

  const isDepositButtonDisabled = () => {
    if (isWalletConnected && needsApproval) return false

    // for some reason the form is always invalid? Need to debug why
    // if (isWalletConnected && !formState.isValid) return true
  }

  const handleDepositButtonClick = (e) => {
    e.preventDefault()

    if (!isWalletConnected) {
      connectWallet()
    }

    if (isWalletConnected && needsApproval) {
      handleApprove()
    }

    if (isWalletConnected && !needsApproval) {
      setReviewDeposit(quantity)
      handleSubmit(onSubmit)
    }
  }

  const depositValidationRules = {
    isValid: (v) => {
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false

      const decimals = underlyingToken.decimals

      if (usersAddress) {
        if (!usersUnderlyingBalance) return false
        if (!usersTicketBalance) return false
        if (parseUnits(usersUnderlyingBalance).lt(parseUnits(v, decimals)))
          return t('insufficientFunds')
      }

      if (getMaxPrecision(v) > decimals) return false
      if (parseUnits(v, decimals).isZero()) return false
      return true
    }
  }

  const closeModal = () => {
    const { query, pathname } = router
    delete query.showConfirmModal
    router.replace({ pathname, query })
    setShowConfirmModal(false)
  }

  const onDepositTxSuccess = () => {
    const { query, pathname } = router
    delete query.quantity
    query.success = '1'
    router.replace({ pathname, query })

    setTimeout(() => {
      const { query, pathname } = router
      delete query.success
      router.replace({ pathname, query })

      setActiveStep(DEPOSIT_STATES.depositing)
    }, 10000)
  }

  const handleConfirmClick = async (e) => {
    e.preventDefault()

    const params = [usersAddress, quantityBN, ticketAddress, ethers.constants.AddressZero]

    const name = `${t('deposit')} ${quantityFormatted} ${tokenSymbol}`

    // const id = await sendTx(txName, PrizePoolAbi, poolAddress, method, params)

    const txId = await sendTx({
      name,
      contractAbi: PrizePoolAbi,
      contractAddress,
      method: 'depositTo',
      params,
      callbacks: {
        onSent: closeModal,
        onSuccess: onDepositTxSuccess,
        refetch: tokenAllowancesRefetch
      }
    })
    setDepositTxId(txId)
  }

  return (
    <>
      <ConfirmModal
        {...props}
        handleConfirmClick={handleConfirmClick}
        isOpen={showConfirmModal}
        closeModal={closeModal}
        showConfirmModal={showConfirmModal}
      />

      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            autoFocus
            unsignedNumber
            readOnly={depositTxInFlight}
            type='number'
            symbolAndIcon={<TokenSymbolAndIcon {...props} />}
            Input={TsunamiInput}
            validate={depositValidationRules}
            containerBgClasses={'bg-transparent'}
            containerRoundedClasses={'rounded-lg'}
            bgClasses={'bg-body'}
            placeholder='0.0'
            id='quantity'
            name='quantity'
            register={register}
            label={
              <div className='font-inter font-semibold uppercase text-accent-3 opacity-60'>
                {t('depositTicker', { ticker: tokenSymbol })}
              </div>
            }
            required={t('ticketQuantityRequired')}
            autoComplete='off'
            rightLabel={
              isWalletConnected &&
              usersUnderlyingBalance && (
                <>
                  <button
                    id='_setMaxDepositAmount'
                    type='button'
                    className='font-bold inline-flex items-center text-accent-4'
                    onClick={(e) => {
                      e.preventDefault()
                      setValue('quantity', usersUnderlyingBalance, { shouldValidate: true })
                    }}
                  >
                    <img src={WalletIcon} className='mr-2' style={{ maxHeight: 12 }} />
                    {numberWithCommas(usersUnderlyingBalance)} {tokenSymbol}
                  </button>
                </>
              )
            }
          />
        </div>

        <DownArrow />

        <div className='w-full mx-auto'>
          <TextInputGroup
            readOnly
            disabled
            symbolAndIcon='PRZUSDC'
            Input={TsunamiInput}
            roundedClasses={'rounded-lg'}
            containerRoundedClasses={'rounded-lg'}
            placeholder='0.0'
            id='result'
            name='result'
            register={register}
            label={null}
            value={form.watch('quantity') || '0'}
          />
        </div>

        <ErrorsBox errors={errors} />

        <div className='flex flex-col mx-auto w-full items-center justify-center'>
          <button
            className='new-btn rounded-lg w-full text-xl py-2 mt-2'
            disabled={isDepositButtonDisabled()}
            onClick={handleDepositButtonClick}
          >
            {depositButtonLabel()}
          </button>
        </div>

        <GradientBanner
          {...props}
          approveTxInFlight={approveTxInFlight}
          depositTxInFlight={depositTxInFlight}
          depositTxSuccess={depositTxSuccess}
          depositTx={depositTx}
          approveTx={approveTx}
        />

        <FormStepper activeStep={activeStep} />
      </form>
    </>
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

const GradientBanner = (props) => {
  const { approveTxInFlight, depositTxInFlight, depositTx, depositTxSuccess, approveTx } = props
  const { t } = useTranslation()

  let contents = null
  if (depositTxSuccess) {
    contents = t('disclaimerComeBackRegularlyToClaimWinnings')
  } else {
    if (depositTxInFlight) {
      contents = <TxStatus {...props} txHash={depositTx.hash} />
    } else if (approveTxInFlight) {
      contents = <TxStatus {...props} txHash={approveTx.hash} />
    } else {
      contents = t('chancesToWinAreProportional')
    }
  }

  return (
    <div className='font-inter gradient-new text-center py-1 mt-4 text-xxxs rounded-lg text-white'>
      {/* <div className='font-inter gradient-new text-center py-1 mt-4 text-xxxs rounded-lg text-white h-6'> */}
      {contents}
    </div>
  )
}

const DownArrow = (props) => {
  return (
    <div className={props.className || 'text-default opacity-40'}>
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='fill-current mx-auto mb-2'
      >
        <path d='M7 1V12.17L2.12 7.29C1.73 6.9 1.09 6.9 0.700001 7.29C0.310001 7.68 0.310001 8.31 0.700001 8.7L7.29 15.29C7.68 15.68 8.31 15.68 8.7 15.29L15.29 8.7C15.68 8.31 15.68 7.68 15.29 7.29C14.9 6.9 14.27 6.9 13.88 7.29L9 12.17V1C9 0.45 8.55 0 8 0C7.45 0 7 0.45 7 1Z' />
      </svg>
    </div>
  )
}

const ConfirmModal = (props) => {
  const { handleConfirmClick } = props
  const { t } = useTranslation()
  const router = useRouter()
  const quantity = router.query.quantity

  // 'h-full sm:h-auto sm:max-w-sm': !noSize,
  return (
    <Modal
      noSize
      className='confirm-modal h-full sm:h-auto sm:max-w-md shadow-3xl'
      label={`Confirm Deposit Modal`}
      isOpen={Boolean(props.isOpen)}
      closeModal={props.closeModal}
    >
      <div className='relative text-inverse p-6 h-screen sm:h-auto rounded-none sm:rounded-sm mx-auto flex flex-col'>
        <div className='flex flex-col justify-center items-center pb-6'>
          <div className='text-xl font-bold mt-8 text-white'>
            {t('depositConfirmation', 'Deposit confirmation')}
          </div>
          <div className='w-full mx-auto mt-8'>
            <TextInputGroup
              readOnly
              disabled
              symbolAndIcon={<TokenSymbolAndIcon {...props} />}
              Input={TsunamiInput}
              textClasses={'text-xl text-right text-inverse'}
              className={'font-inter font-semibold opacity-100'}
              containerBgClasses={'bg-body'}
              containerRoundedClasses={'rounded-lg'}
              bgClasses={'bg-body'}
              id='quantity-confirm-modal'
              name='quantity-confirm-modal'
              register={() => {}}
              value={quantity}
            />

            <DownArrow className='text-white' />

            <TextInputGroup
              readOnly
              disabled
              symbolAndIcon='PRZUSDC'
              Input={TsunamiInput}
              roundedClasses={'rounded-lg'}
              containerRoundedClasses={'rounded-lg'}
              placeholder='0.0'
              register={() => {}}
              id='result-confirm-modal'
              name='result-confirm-modal'
              label={null}
              value={quantity}
            />

            <div className='bg-accent-grey-5 text-xxs font-inter font-semibold p-5 rounded-lg mt-10'>
              <div className='flex-col'>
                <div className='flex justify-between mb-1'>
                  {/* <div className=''>{t('winningOddsPerTicker', { ticker: 'PRZUSDC' })}</div> */}
                  <div className=''>{t('tickerToReceive', { ticker: 'PRZUSDC' })}</div>
                  <div className=''>{quantity}</div>
                </div>
                <div className='flex justify-between mt-1'>
                  {/* <div className=''>{t('winningOddsPerTicker', { ticker: 'PRZUSDC' })}</div> */}
                  <div className=''>{t('exitFee')}</div>
                  <div className='text-orange'>~1% before 10 days</div>
                </div>
              </div>
            </div>

            <button
              className='new-btn rounded-lg w-full text-xl py-2 mt-8'
              disabled={false}
              onClick={handleConfirmClick}
            >
              {t('confirmDeposit', 'Confirm deposit')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const TokenSymbolAndIcon = (props) => {
  const { tokenAddress, tokenSymbol } = props
  return (
    <>
      <span className='relative' style={{ top: -3 }}>
        <CurrencyIcon xxs address={tokenAddress} />{' '}
      </span>
      {tokenSymbol}
    </>
  )
}
