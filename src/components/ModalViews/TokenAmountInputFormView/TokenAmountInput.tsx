import { TokenAmountInputFlat } from '@pooltogether/react-components'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FORM_KEY } from '.'
import { Token, useTokenBalance } from '@pooltogether/hooks'

export interface TokenAmountInputProps {
  chainId: number
  token: Token
  useValidationRules: () => { [key: string]: (value: string) => boolean | string }
  className?: string
  widthClassName?: string
}

/**
 * For use in conjunction with react-hook-form
 * @param props
 * @returns
 */
export const TokenAmountInput = (props: TokenAmountInputProps) => {
  const { chainId, token, className, useValidationRules, widthClassName } = props

  const form = useFormContext()
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: balance } = useTokenBalance(chainId, usersAddress, token?.address)
  const validate = useValidationRules()

  return (
    <TokenAmountInputFlat
      className={className}
      widthClassName={widthClassName}
      form={form}
      inputKey={FORM_KEY.amount}
      token={token}
      balance={balance}
      isWalletConnected={Boolean(usersAddress)}
      chainId={chainId}
      t={t}
      validate={validate}
      i18nKey='amount'
      autoComplete='off'
      usersAddress={usersAddress}
    />
  )
}

TokenAmountInput.defaultProps = {
  widthClassName: 'w-full'
}
