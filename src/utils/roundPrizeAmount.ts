import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'

export const roundPrizeAmount = (amountUnformatted: BigNumber, decimals: string) =>
  getAmountFromUnformatted(amountUnformatted, decimals, { hideZeroes: true })
