import { BigNumber } from 'ethers'
import { divideBigNumbers } from './divideBigNumbers'

/**
 * Assumes the BigNumbers are the same decimals
 * @param totalSupplyAmountUnformatted
 * @param dailyPrizeAmountUnformatted
 * @returns
 */
export const calculateApr = async (
  totalSupplyAmountUnformatted: BigNumber,
  dailyPrizeAmountUnformatted: BigNumber
) => {
  if (totalSupplyAmountUnformatted.isZero() || dailyPrizeAmountUnformatted.isZero()) {
    return '0'
  }
  const totalYearlyPrizesUnformatted = dailyPrizeAmountUnformatted.mul(365)
  const x = divideBigNumbers(totalYearlyPrizesUnformatted, totalSupplyAmountUnformatted)
  return (x * 100).toFixed(2)
}
