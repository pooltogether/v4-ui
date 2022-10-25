import { Amount } from '@pooltogether/hooks'
import { getAmountFromUnformatted } from '@pooltogether/utilities'

export const addAmounts = (a: Amount, b: Amount, decimals: string) => {
  const total = a.amountUnformatted.add(b.amountUnformatted)
  return getAmountFromUnformatted(total, decimals)
}
