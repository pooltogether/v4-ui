import { getMaxPrecision } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'

/**
 *
 * @param bn BigNumber
 * @param percentage ex. 0.2
 * @param precision ex. 0.2
 * @returns
 */
export const percentageOfBigNumber = (bn: BigNumber, percentage: number) => {
  const precision = getMaxPrecision(percentage)
  return bn.mul(percentage * 10 ** precision).div(10 ** precision)
}
