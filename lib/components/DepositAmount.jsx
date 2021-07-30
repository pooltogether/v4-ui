import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { parseUnits } from '@ethersproject/units'
import { Button, SimpleInput, TextInputGroup } from '@pooltogether/react-components'
import { getMaxPrecision, numberWithCommas, queryParamUpdater } from '@pooltogether/utilities'

import { ErrorsBox } from 'lib/components/ErrorsBox'
// import { WithdrawAndDepositPaneTitle } from 'lib/components/WithdrawAndDepositPaneTitle'

import DownArrow from 'assets/images/down-arrow.svg'
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
            Input={SimpleInput}
            validate={depositValidationRules}
            unsignedNumber
            autoFocus
            large
            placeholder='0.0'
            id='quantity'
            name='quantity'
            register={register}
            label={t('swap')}
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
        <div
          className='text-sm text-highlight-1 font-bold mb-2'
          style={{
            minHeight: 26
          }}
        >
          {Object.values(errors).length > 0 && <ErrorsBox errors={errors} />}
        </div>

        <img src={DownArrow} className='mx-auto my-2' />

        <div className='flex flex-col mx-auto w-full items-center justify-center'>
          <Button
            textSize='lg'
            disabled={!formState.isValid}
            onClick={handleSubmit(onSubmit)}
            className={'mx-auto'}
          >
            {t('continue')}
          </Button>
        </div>
      </form>
    </>
  )
}
