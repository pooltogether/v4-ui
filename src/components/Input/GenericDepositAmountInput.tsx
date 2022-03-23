import React, { useEffect } from 'react'
import classNames from 'classnames'
import { TokenWithBalance } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'
import { ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'
import { FieldValues, UseFormReturn } from 'react-hook-form'

import { WalletSvg } from '@components/Icons/SvgComponents'
import { useMinimumDepositAmount } from '@hooks/v4/PrizePool/useMinimumDepositAmount'
import { useUsersAddress } from '@hooks/useUsersAddress'

interface GenericDepositAmountInputProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  isTokenBalanceFetched: Boolean
  tokenBalance: TokenWithBalance
  ticketBalance: TokenWithBalance
  inputKey: string
  className?: string
  bgClassName?: string
  widthClassName?: string
  depositTokenClassName?: string
}

/**
 * For use in conjunction with react-hook-form
 * @param props
 * @returns
 */
export const GenericDepositAmountInput = (props: GenericDepositAmountInputProps) => {
  const { className, bgClassName, widthClassName } = props

  return (
    <div className={classNames(className, widthClassName, 'flex flex-col text-xl')}>
      <GenericDepositInputHeader {...props} />

      <div
        className={classNames(
          bgClassName,
          'p-0.5 rounded-lg overflow-hidden',
          'transition-all hover:bg-gradient-cyan focus-within:bg-pt-gradient',
          'cursor-pointer'
        )}
      >
        <div className={classNames(bgClassName, 'w-full rounded-lg flex')}>
          <DepositToken {...props} />
          <Input {...props} />
        </div>
      </div>
    </div>
  )
}

GenericDepositAmountInput.defaultProps = {
  widthClassName: 'w-full',
  bgClassName: 'bg-tertiary',
  depositTokenClassName: 'text-xl'
}

interface GenericDepositInputHeaderProps extends GenericDepositAmountInputProps {}

const GenericDepositInputHeader = (props: GenericDepositInputHeaderProps) => {
  const { form, tokenBalance, inputKey, isTokenBalanceFetched } = props

  const { t } = useTranslation()
  const usersAddress = useUsersAddress()

  const { trigger, setValue } = form

  // If the user input a larger amount than their wallet balance before connecting a wallet
  useEffect(() => {
    trigger(inputKey)
  }, [usersAddress, tokenBalance])

  return (
    <div className='flex justify-between text-xs uppercase font-semibold text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter mb-1'>
      <span className={classNames('')}>{t('amount')}</span>
      {usersAddress && (
        <button
          id='_setMaxDepositAmount'
          type='button'
          className='font-bold inline-flex items-center '
          disabled={!tokenBalance}
          onClick={(e) => {
            e.preventDefault()
            setValue(inputKey, tokenBalance.amount, { shouldValidate: true })
          }}
        >
          {/* <img src={WalletIcon} className='mr-2' style={{ maxHeight: 12 }} /> */}
          <WalletSvg className='mr-2' />
          {!isTokenBalanceFetched ? (
            <ThemedClipSpinner sizeClassName='w-3 h-3' className='mr-2 opacity-50' />
          ) : (
            <span className='mr-1'>{tokenBalance?.amountPretty || 0}</span>
          )}
          <span>{tokenBalance?.symbol}</span>
        </button>
      )}
    </div>
  )
}

interface DepositTokenProps extends GenericDepositAmountInputProps {}

const DepositToken = (props: DepositTokenProps) => {
  const { chainId, tokenBalance, depositTokenClassName } = props

  if (!tokenBalance) {
    return null
  }

  return (
    <div
      className={classNames(
        'flex items-center',
        'py-4 pl-8 pr-4',
        'placeholder-white placeholder-opacity-50',
        depositTokenClassName
      )}
    >
      <TokenIcon
        sizeClassName='w-6 h-6'
        className='mr-2'
        chainId={chainId}
        address={tokenBalance.address}
      />
      <span className='font-bold'>{tokenBalance.symbol}</span>
    </div>
  )
}

interface InputProps extends GenericDepositAmountInputProps {}

const Input = (props: InputProps) => {
  const { form, inputKey, ticketBalance, tokenBalance } = props
  const { t } = useTranslation()

  const { register } = form

  const validate = useDepositValidationRules(tokenBalance, ticketBalance)

  const pattern = {
    value: /^\d*\.?\d*$/,
    message: t('pleaseEnterAPositiveNumber')
  }

  return (
    <input
      className={classNames(
        'bg-transparent w-full outline-none focus:outline-none active:outline-none text-right py-4 pr-8 pl-4 font-semibold'
      )}
      placeholder='0.0'
      {...register(inputKey, { required: true, pattern, validate })}
    />
  )
}

/**
 * Returns validation rules for the deposit input
 * @param prizePool
 * @returns
 */
const useDepositValidationRules = (tokenBalance, ticketBalance) => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()

  const decimals = tokenBalance?.decimals
  const minimumDepositAmount = useMinimumDepositAmount(tokenBalance)

  return {
    isValid: (v: string) => {
      const isNotANumber = isNaN(Number(v))
      if (isNotANumber) return false
      if (!minimumDepositAmount) return false

      const quantityUnformatted = safeParseUnits(v, decimals)

      if (!!usersAddress) {
        if (!tokenBalance) return false
        if (!ticketBalance) return false
        if (quantityUnformatted && tokenBalance.amountUnformatted.lt(quantityUnformatted))
          return t(
            'insufficientFundsGetTokensBelow',
            'Insufficient funds. Get or swap tokens below.'
          )
      }

      if (getMaxPrecision(v) > Number(decimals)) return false
      if (quantityUnformatted && quantityUnformatted.isZero()) return false
      return true
    }
  }
}
