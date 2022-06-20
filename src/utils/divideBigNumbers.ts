import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

/**
 *
 * @returns
 */
export const divideBigNumbers = (a: BigNumber, b: BigNumber, precision: number = 4) => {
  console.log('divideBigNumbers', {
    a,
    b,
    precision,
    first: a.mul(10 ** precision).toString(),
    second: a
      .mul(10 ** precision)
      .div(b)
      .toString(),
    third: formatUnits(a.mul(10 ** precision).div(b), String(precision))
  })
  return Number(formatUnits(a.mul(10 ** precision).div(b), String(precision)))
}
