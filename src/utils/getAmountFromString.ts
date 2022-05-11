import { Amount } from '@pooltogether/hooks'
import { numberWithCommas, stringWithPrecision } from '@pooltogether/utilities'
import { ethers } from 'ethers'

const EMPTY_AMOUNT: Amount = {
  amount: '',
  amountUnformatted: undefined,
  amountPretty: ''
}

/**
 *
 * @param amount formatted amount
 * @param decimals
 * @returns
 */
export const getAmountFromString = (amount: string, decimals: string): Amount => {
  try {
    if (!amount || amount === undefined || !decimals || decimals === undefined) {
      return EMPTY_AMOUNT
    }
    const trimmedAmount = stringWithPrecision(amount, { precision: Number(decimals) })

    return {
      amount,
      amountUnformatted: ethers.utils.parseUnits(trimmedAmount, decimals),
      amountPretty: numberWithCommas(trimmedAmount) as string
    }
  } catch (e) {
    console.error(e.message)
    return EMPTY_AMOUNT
  }
}
