import { PrizePool, PrizeTier } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { getNumberOfPrizes } from '@utils/getNumberOfPrizes'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { parse } from 'path'
import { useQuery } from 'react-query'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { usePrizePoolTicketDecimals } from './usePrizePoolTicketDecimals'
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
  const { data: decimals } = usePrizePoolTicketDecimals(prizePool)

  return useQuery(
    getPrizePoolTotalNumberOfPrizesKey(
      prizeTierData?.prizeTier,
      prizePoolPercentageOfPicksData?.percentage,
      decimals
    ),
    () =>
      getPrizePoolTotalNumberofPrizes(
        prizePool,
        prizeTierData?.prizeTier,
        prizePoolPercentageOfPicksData?.percentage,
        decimals
      ),
    { enabled: isPrizeTierFetched && isPercentageFetched && !!decimals }
  )
}

export const getPrizePoolTotalNumberOfPrizesKey = (
  prizeTier: PrizeTier,
  percentage: number,
  decimals: string
) => [
  'usePrizePoolTotalNumberOfPrizes',
  prizeTier?.bitRangeSize,
  prizeTier?.tiers.join('-'),
  percentage,
  decimals
]

export const getPrizePoolTotalNumberofPrizes = (
  prizePool: PrizePool,
  prizeTier: PrizeTier,
  percentageOfPicks: number,
  decimals: string
) => {
  const totalNumberOfPrizes = getNumberOfPrizes(prizeTier.tiers, prizeTier.bitRangeSize)
  const totalValueOfPrizes = getAmountFromBigNumber(
    prizeTier.prize.mul(parseUnits(percentageOfPicks.toString(), 8)).div(parseUnits('1', 8)),
    decimals
  )
  return {
    chainId: prizePool.chainId,
    prizePoolId: prizePool.id(),
    numberOfPrizes: totalNumberOfPrizes * percentageOfPicks,
    percentageOfPicks,
    totalValueOfPrizes
  }
}
