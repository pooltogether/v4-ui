import { Amount } from '@pooltogether/hooks'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

export const addAmounts = (a: Amount, b: Amount, decimals: string) => {
  const total = a.amountUnformatted.add(b.amountUnformatted)
  return getAmountFromBigNumber(total, decimals)
}
