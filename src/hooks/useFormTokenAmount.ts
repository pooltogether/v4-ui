import { Token } from '@pooltogether/hooks'
import { getAmountFromString } from '@utils/getAmountFromString'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

export const useFormTokenAmount = (field: string, token: Token) => {
  const amount: string = useWatch({ name: field })
  return useMemo(
    () => (!!token?.decimals ? getAmountFromString(amount, token?.decimals) : null),
    [amount, token?.decimals]
  )
}
