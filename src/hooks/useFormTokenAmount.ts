import { Token } from '@pooltogether/hooks'
import { getAmount } from '@pooltogether/utilities'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

export const useFormTokenAmount = (field: string, token: Token) => {
  const amount: string = useWatch({ name: field })
  return useMemo(
    () => (!!token?.decimals ? getAmount(amount, token?.decimals) : null),
    [amount, token?.decimals]
  )
}
