import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from './getAmountFromBigNumber'

// TODO: Round to 6 decimal places for ultimate accuracy
export const roundPrizeAmount = (amountUnformatted: BigNumber, decimals: string) =>
  getAmountFromBigNumber(amountUnformatted, decimals, 0)
