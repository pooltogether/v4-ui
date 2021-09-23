import { Amount } from '.yalc/@pooltogether/hooks/dist'
import { numberWithCommas } from '@pooltogether/utilities'
import { ethers } from 'ethers'

export const getAmountFromString = (amount: string, decimals: string): Amount => {
  try {
    if (!amount || amount === undefined) {
      return {
        amount: '',
        amountUnformatted: undefined,
        amountPretty: ''
      }
    }

    return {
      amount,
      amountUnformatted: ethers.utils.parseUnits(amount, decimals),
      amountPretty: numberWithCommas(amount) as string
    }
  } catch (e) {
    return {
      amount,
      amountUnformatted: undefined,
      amountPretty: ''
    }
  }
}
