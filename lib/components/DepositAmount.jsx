import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { parseUnits } from '@ethersproject/units'
// import { Button, TsunamiInput, TextInputGroup } from '@pooltogether/react-components'
import { Button } from '@pooltogether/react-components'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { TsunamiInput } from 'lib/components/TextInputs'
import { getMaxPrecision, numberWithCommas, queryParamUpdater } from '@pooltogether/utilities'

import { ErrorsBox } from 'lib/components/ErrorsBox'
// import { WithdrawAndDepositPaneTitle } from 'lib/components/WithdrawAndDepositPaneTitle'

import WalletIcon from 'assets/images/icon-wallet.svg'

export const DepositAmount = (props) => {
  const {
    quantity: queryQuantity,
    usersAddress,
    usersUnderlyingBalance,
    usersTicketBalance,
    decimals,
    label,
    tokenSymbol,
    tokenAddress,
    // nextStep,
    form
  } = props

  const { t } = useTranslation()
  const router = useRouter()

  const { handleSubmit, register, formState, setValue } = form
  const { errors } = formState

  // Set quantity from the query parameter
  useEffect(() => {
    if (queryQuantity) {
      setValue('quantity', queryQuantity, { shouldValidate: true })
    }
  }, [])

  const onSubmit = (values) => {
    if (formState.isValid) {
      queryParamUpdater.add(router, {
        quantity: values.quantity,
        prevUnderlyingBalance: usersUnderlyingBalance,
        prevTicketBalance: usersTicketBalance
      })
      // nextStep()
    }
  }

  const depositValidationRules = {
    isValid: (v) => {
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      if (!usersUnderlyingBalance) return false
      if (!usersTicketBalance) return false
      if (getMaxPrecision(v) > decimals) return false
      if (parseUnits(usersUnderlyingBalance, decimals).lt(parseUnits(v, decimals))) return false
      if (parseUnits(v, decimals).isZero()) return false
      return true
    }
  }

  return (
    <>
      {/* <WithdrawAndDepositPaneTitle label={label} symbol={tokenSymbol} address={tokenAddress} /> */}

      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            autoFocus
            unsignedNumber
            tickerUpcased='USDC'
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
              <>
                <div className='font-semibold text-accent-3'>{t('swap')}</div>
              </>
            }
            required={t('ticketQuantityRequired')}
            autoComplete='off'
            rightLabel={
              usersAddress &&
              usersUnderlyingBalance && (
                <>
                  <button
                    id='_setMaxDepositAmount'
                    type='button'
                    className='font-bold inline-flex items-center'
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
            tickerUpcased='PRZUSDC'
            Input={TsunamiInput}
            roundedClasses={'rounded-lg'}
            containerRoundedClasses={'rounded-lg'}
            placeholder='0.0'
            id='result'
            name='result'
            register={register}
            label={null}
          />
        </div>

        <div
          className='text-sm text-highlight-1 font-bold mb-2'
          style={{
            minHeight: 26
          }}
        >
          {Object.values(errors).length > 0 && <ErrorsBox errors={errors} />}
        </div>

        <div className='flex flex-col mx-auto w-full items-center justify-center'>
          <button
            className='new-btn rounded-lg w-full text-xl py-3 mt-2'
            disabled={!formState.isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {t('connectWalletToDeposit')}
          </button>
        </div>

        <div className='font-bold gradient-new text-center py-2 mt-4 text-xxs rounded-lg text-white'>
          {t('chancesToWinAreProportional')}
        </div>
      </form>
    </>
  )
}

const DownArrow = (props) => {
  return (
    <div className='text-default opacity-40'>
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
