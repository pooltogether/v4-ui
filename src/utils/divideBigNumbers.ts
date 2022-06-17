import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

/**
 *
 * @returns
 */
export const divideBigNumbers = (a: BigNumber, b: BigNumber, precision: number = 4) =>
  Number(formatUnits(a.mul(10 ** precision).div(b), 10 ** precision))

console.log({ BigNumber, divideBigNumbers })
