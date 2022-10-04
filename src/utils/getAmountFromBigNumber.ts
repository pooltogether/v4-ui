import { Amount } from '@pooltogether/hooks'
import { numberWithCommas, getMinPrecision } from '@pooltogether/utilities'
import { BigNumber, ethers } from 'ethers'

const EMPTY_AMOUNT: Amount = {
  amount: '',
  amountUnformatted: undefined,
  amountPretty: ''
}

export const getAmountFromBigNumber = (amountUnformatted: BigNumber, decimals: string): Amount => {
  try {
    if (!amountUnformatted || amountUnformatted === undefined || !decimals) {
      return EMPTY_AMOUNT
    }
    const amount = ethers.utils.formatUnits(amountUnformatted, decimals)
    return {
      amountUnformatted,
      amount,
      amountPretty: numberWithCommas(amount, { precision: getMinPrecision(amount) }) as string
    }
  } catch (e) {
    return EMPTY_AMOUNT
  }
}
