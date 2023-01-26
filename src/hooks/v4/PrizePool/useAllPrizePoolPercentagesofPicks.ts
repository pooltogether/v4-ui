import { useQueries } from 'react-query'
import { useAllPrizePoolTicketTwabTotalSupplies } from './useAllPrizePoolTicketTwabTotalSupplies'
import { useAllUpcomingPrizeTiers } from './useAllUpcomingPrizeTiers'
import {
  calculatePrizePoolPercentageOfPicks,
  calculatePrizePoolPercentageOfPicksKey
} from './usePrizePoolPercentageOfPicks'
import { usePrizePools } from './usePrizePools'
import { usePrizeDistributors } from '../PrizeDistributor/usePrizeDistributors'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'

/**
 * NOTE: Assumes 1 PrizeDistributor per chain
 * @returns
 */
export const useAllPrizePoolPercentagesofPicks = () => {
  const prizePools = usePrizePools()
  const prizeDistributors = usePrizeDistributors()
  const allPrizePoolTicketTwabTotalSupplies = useAllPrizePoolTicketTwabTotalSupplies()
  const {
    data: prizePoolNetworkTvlData,
    isFetched: isPrizePoolNetworkTvlFetched,
    isError: isPrizePoolNetworkTvlError
  } = usePrizePoolNetworkTicketTwabTotalSupply()
  const allUpcomingPrizeTiers = useAllUpcomingPrizeTiers()

  const isPrizeTierFetched = allUpcomingPrizeTiers.every(
    ({ isFetched, isError }) => isFetched && !isError
  )
  const isTwabsFetched = allPrizePoolTicketTwabTotalSupplies.every(
    ({ isFetched, isError }) => isFetched && !isError
  )

  return useQueries(
    isTwabsFetched &&
      isPrizeTierFetched &&
      isPrizePoolNetworkTvlFetched &&
      !isPrizePoolNetworkTvlError
      ? prizePools.map((prizePool) => {
          const prizePoolTicketTwabQueryResult = allPrizePoolTicketTwabTotalSupplies.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )
          const prizeDistributor = prizeDistributors.find(
            (prizeDistributor) => prizeDistributor.chainId === prizePool.chainId
          )
          const prizeTierQueryResult = allUpcomingPrizeTiers.find(
            ({ data }) => data?.prizeDistributorId === prizeDistributor.id()
          )

          const prizePoolTvl = prizePoolTicketTwabQueryResult?.data?.amount

          return {
            queryKey: calculatePrizePoolPercentageOfPicksKey(
              prizePool,
              prizePoolTvl,
              prizePoolNetworkTvlData?.totalSupply,
              prizeTierQueryResult?.data.prizeTier
            ),
            queryFn: async () => {
              return await calculatePrizePoolPercentageOfPicks(
                prizePool,
                prizePoolTvl,
                prizePoolNetworkTvlData?.totalSupply,
                prizeTierQueryResult?.data.prizeTier
              )
            },
            enabled:
              !!prizeTierQueryResult &&
              !!prizeTierQueryResult.isFetched &&
              !prizeTierQueryResult.isError
          }
        })
      : []
  )
}
