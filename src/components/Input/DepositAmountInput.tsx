import { useMinimumDepositAmount } from '@hooks/v4/PrizePool/useMinimumDepositAmount'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { TokenAmountInput } from '@pooltogether/react-components'
import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'


interface DepositAmountInputProps {
  form: UseFormReturn<FieldValues, object>
  prizePool: PrizePool
  inputKey: string
  className?: string
  widthClassName?: string
}

/**
 * For use in conjunction with react-hook-form
 * @param props
 * @returns
 */
export const DepositAmountInput = (props: DepositAmountInputProps) => {
  const { prizePool, className, widthClassName, form, inputKey } = props

  const { t } = useTranslation()
  const chainId = prizePool.chainId
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: usersBalancesData } = useUsersPrizePoolBalances(usersAddress, prizePool)
  const token = prizePoolTokens?.token
  const balance = usersBalancesData?.balances.token
  const validate = useDepositValidationRules(prizePool)

  return (
    <TokenAmountInput
      className={className}
      widthClassName={widthClassName}
      form={form}
      inputKey={inputKey}
      token={token}
      balance={balance}
      isWalletConnected={Boolean(usersAddress)}
      chainId={chainId}
      t={t}
      validate={validate}
      i18nKey='amount'
      autoComplete='off'
    />
  )
}

DepositAmountInput.defaultProps = {
  widthClassName: 'w-full'
}

interface DepositInputHeaderProps {
  form: UseFormReturn<FieldValues, object>
  prizePool: PrizePool
  inputKey: string
}

/**
 * Returns validation rules for the deposit input
 * @param prizePool
 * @returns
 */
const useDepositValidationRules = (prizePool: PrizePool) => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: usersBalancesData } = useUsersPrizePoolBalances(usersAddress, prizePool)

  const token = prizePoolTokens?.token
  const decimals = token?.decimals
  const minimumDepositAmount = useMinimumDepositAmount(prizePool, token)
  const usersBalances = usersBalancesData?.balances
  const tokenBalance = usersBalances?.token
  const ticketBalance = usersBalances?.ticket

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
        if (quantityUnformatted && minimumDepositAmount.amountUnformatted.gt(quantityUnformatted))
          return t(
            'minimumDepositOfAmountRequired',
            `Minimum deposit of {{amount}} {{token}} required`,
            { amount: minimumDepositAmount.amountPretty, token: token.symbol }
          )
      }

      if (getMaxPrecision(v) > Number(decimals)) return false
      if (quantityUnformatted && quantityUnformatted.isZero()) return false
      return true
    }
  }
}
