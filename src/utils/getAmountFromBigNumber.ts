import { Amount } from '@pooltogether/hooks'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'

const EMPTY_AMOUNT: Amount = {
  amount: '',
  amountUnformatted: undefined,
  amountPretty: ''
}

export const getAmountFromBigNumber = (amountUnformatted: BigNumber, decimals: string): Amount => {
  try {
    if (!amountUnformatted || amountUnformatted === undefined) {
      return EMPTY_AMOUNT
    }
    const amount = ethers.utils.formatUnits(amountUnformatted, decimals)

    // Properly round
    // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
    const amountRounded = Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100

    return {
      amountUnformatted,
      amount: amountRounded.toString(),
      amountPretty: numberWithCommas(amountRounded) as string
    }
  } catch (e) {
    return EMPTY_AMOUNT
  }
}
