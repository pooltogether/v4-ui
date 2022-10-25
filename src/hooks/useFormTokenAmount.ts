import { Amount, Token } from '@pooltogether/hooks'
import { getAmount as _getAmount } from '@pooltogether/utilities'
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback'
import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'

export const useFormTokenAmount = (field: string, token: Token) => {
  const _amount: string = useWatch({ name: field })
  const [amount, setAmount] = useState<Amount>()

  const getAmount = useDebouncedCallback((amount: string, decimals: string) =>
    _getAmount(amount, decimals)
  )

  useEffect(() => {
    if (token?.decimals) {
      setAmount(_getAmount(_amount, token.decimals))
    }
  }, [token?.decimals, _amount])

  return amount
}
