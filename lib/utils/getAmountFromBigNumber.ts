import { Amount } from '@pooltogether/hooks'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'

export const getAmountFromBigNumber = (amountUnformatted: BigNumber, decimals: string): Amount => {
  try {
    if (!amountUnformatted || amountUnformatted === undefined) {
      return {
        amount: '',
        amountUnformatted: undefined,
        amountPretty: ''
      }
    }
    const amount = ethers.utils.formatUnits(amountUnformatted, decimals)
    return {
      amountUnformatted,
      amount,
      amountPretty: numberWithCommas(amount) as string
    }
  } catch (e) {
    return {
      amount: '',
      amountUnformatted: undefined,
      amountPretty: ''
    }
  }
}
