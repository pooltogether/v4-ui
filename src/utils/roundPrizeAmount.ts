import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

import { getAmountFromString } from './getAmountFromString'

// TODO: Round to 6 decimal places for ultimate accuracy
export const roundPrizeAmount = (amountUnformatted: BigNumber, decimals: string) =>
  getAmountFromString(
    Math.round(Number(formatUnits(amountUnformatted, decimals))).toString(),
    decimals
  )
