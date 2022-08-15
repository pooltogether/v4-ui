import { TokenAmountInput } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useDepositValidationRules } from '@hooks/v4/PrizePool/useDepositValidationRules'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

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
  const { data: usersBalancesData } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)
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
