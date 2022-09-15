import { PrizePool, PrizeTier } from '@pooltogether/v4-client-js'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { useQuery } from 'react-query'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * Total number of prizes is the percentage of picks given to the supplied prize pool multiplied by the total number of prizes
 * @param prizePool
 * @returns
 */
export const usePrizePoolTotalNumberOfPrizes = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: prizePoolPercentageOfPicksData, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  return useQuery(
    getPrizePoolTotalNumberOfPrizesKey(
      prizeTierData?.prizeTier,
      prizePoolPercentageOfPicksData?.percentage
    ),
    () =>
      getPrizePoolTotalNumberofPrizes(
        prizePool,
        prizeTierData?.prizeTier,
        prizePoolPercentageOfPicksData?.percentage
      ),
    { enabled: isPrizeTierFetched && isPercentageFetched }
  )
}

export const getPrizePoolTotalNumberOfPrizesKey = (prizeTier: PrizeTier, percentage: number) => [
  'usePrizePoolTotalNumberOfPrizes',
  prizeTier?.bitRangeSize,
  prizeTier?.tiers.join('-'),
  percentage
]

export const getPrizePoolTotalNumberofPrizes = (
  prizePool: PrizePool,
  prizeTier: PrizeTier,
  percentageOfPicks: number
) => {
  const totalNumberOfPrizes = getNumberOfPrizes(prizeTier.tiers, prizeTier.bitRangeSize)
  return {
    prizePoolId: prizePool.id(),
    numberOfPrizes: totalNumberOfPrizes * percentageOfPicks
  }
}
