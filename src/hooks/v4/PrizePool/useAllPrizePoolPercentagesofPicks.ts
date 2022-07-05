import { NO_REFETCH } from '@constants/query'
import { useQueries } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { useAllPrizePoolTicketTwabTotalSupplies } from './useAllPrizePoolTicketTwabTotalSupplies'

import {
  getPrizePoolPercentageOfPicks,
  getPrizePoolPercentageOfPicksKey
} from './usePrizePoolPercentageOfPicks'
import { usePrizePools } from './usePrizePools'

export const useAllPrizePoolPercentagesofPicks = () => {
  const prizePools = usePrizePools()
  const allPrizePoolTicketTwabTotalSupplies = useAllPrizePoolTicketTwabTotalSupplies()
  const { data: prizePoolNetworkTvlData, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  const isTwabsFetched = allPrizePoolTicketTwabTotalSupplies.every(({ isFetched }) => isFetched)

  return useQueries(
    isTwabsFetched
      ? prizePools.map((prizePool) => {
          const prizePoolTicketTwabQueryResult = allPrizePoolTicketTwabTotalSupplies.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool.id()
          )

          const isTicketTwabFetched = prizePoolTicketTwabQueryResult?.isFetched
          const prizePoolTvl = prizePoolTicketTwabQueryResult?.data?.amount

          const enabled =
            !!isTicketTwabFetched && !!isPrizePoolNetworkTvlFetched && !!isTwabsFetched

          return {
            ...NO_REFETCH,
            queryKey: getPrizePoolPercentageOfPicksKey(
              prizePool,
              prizePoolTvl,
              prizePoolNetworkTvlData?.totalSupply
            ),
            queryFn: async () => {
              return await getPrizePoolPercentageOfPicks(
                prizePool,
                prizePoolTvl?.amount,
                prizePoolNetworkTvlData?.totalSupply.amount
              )
            },
            enabled
          }
        })
      : []
  )
}
