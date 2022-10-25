import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool, PrizeTier } from '@pooltogether/v4-client-js'
import { parseUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { PrizeData, usePrizePoolPrizes } from './usePrizePoolPrizes'

/**
 * Fetches prize data and scales it according to the expected number of picks a prize pool will receive
 * @param prizePool
 * @returns
 */
export const usePrizePoolExpectedPrizes = (prizePool: PrizePool) => {
  const { data: prizePoolPercentageOfPicksData, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)
  const { data: prizeData, isFetched: isPrizeDataFetched } = usePrizePoolPrizes(prizePool)

  return useQuery(
    getPrizePoolExpectedPrizesKey(
      prizeData?.prizeTier,
      prizePoolPercentageOfPicksData?.percentage,
      prizeData?.decimals
    ),
    () => getPrizePoolExpectedPrizes(prizeData, prizePoolPercentageOfPicksData?.percentage),
    { enabled: isPrizeDataFetched && isPercentageFetched }
  )
}

export const getPrizePoolExpectedPrizesKey = (
  prizeTier: PrizeTier,
  percentage: number,
  decimals: string
) => [
  'usePrizePoolExpectedPrizes',
  prizeTier?.bitRangeSize,
  prizeTier?.tiers.join('-'),
  percentage,
  decimals
]

export const getPrizePoolExpectedPrizes = (prizeData: PrizeData, percentageOfPicks: number) => {
  const expectedNumberOfPrizesByTier = prizeData.numberOfPrizesByTier.map(
    (numberOfPrizes) => numberOfPrizes * percentageOfPicks
  )
  const expectedTotalNumberOfPrizes = expectedNumberOfPrizesByTier.reduce(
    (total, numberOfPrizes) => total + numberOfPrizes,
    0
  )
  const expectedTotalValueOfPrizes = getAmountFromUnformatted(
    prizeData.prizeTier.prize
      .mul(parseUnits(percentageOfPicks.toString(), 8))
      .div(parseUnits('1', 8)),
    prizeData.decimals
  )
  return {
    ...prizeData,
    percentageOfPicks,
    expectedNumberOfPrizesByTier,
    expectedTotalNumberOfPrizes,
    expectedTotalValueOfPrizes
  }
}
