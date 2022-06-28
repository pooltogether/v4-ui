import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { calculateApr, calculatePercentageOfBigNumber } from '@pooltogether/utilities'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { useUpcomingPrizeConfig } from '../PrizeDistributor/useUpcomingPrizeConfig'

/**
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: prizeConfigData, isFetched: isPrizeConfigFetched } =
    useUpcomingPrizeConfig(prizeDistributor)
  const { data: ticketTwabTotalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: percentage, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  const enabled =
    isPrizeConfigFetched &&
    isTotalSupplyFetched &&
    !!prizeConfigData.prizeConfig &&
    isPercentageFetched

  return useQuery(
    ['usePrizePoolApr', prizeConfigData?.prizeConfig, ticketTwabTotalSupply?.amount],
    () => {
      const scaledDailyPrize = calculatePercentageOfBigNumber(
        prizeConfigData.prizeConfig.prize,
        percentage.percentage
      )
      return calculateApr(ticketTwabTotalSupply.amount.amountUnformatted, scaledDailyPrize)
    },
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
