import { Amount } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

/**
 * NOTE: So if daily prize amounts across prize pools are the same, APR for the network is the same
 * However, if we take into account the percentage of picks, the APR will be different for each prize pool
 * Because then we would use the percentage of picks to calculate the daily prize amount and the prize pool total supply
 *
 * @param totalSupply
 * @param decimals
 * @param dailyPrizeAmountUnformatted
 * @returns
 */
export const calculateApr = async (
  totalSupply: Amount,
  decimals: string,
  dailyPrizeAmountUnformatted: BigNumber
) => {
  if (totalSupply.amountUnformatted.isZero() || dailyPrizeAmountUnformatted.isZero()) {
    return '0'
  }

  const totalYearlyPrizesUnformatted = dailyPrizeAmountUnformatted.mul(365)
  const totalTotalSupply = Number(totalSupply.amount)
  console.log({
    totalYearlyPrizesUnformatted: totalYearlyPrizesUnformatted.toString(),
    totalTotalSupply
  })
  // TODO: Make this big number maths
  const totalYearlyPrizes = totalYearlyPrizesUnformatted.div(10 ** Number(decimals)).toNumber()
  return ((totalYearlyPrizes / totalTotalSupply) * 100).toFixed(2)
}
