import { NO_REFETCH } from '@constants/query'
import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getPrizePoolTicketTwabTotalSupply,
  PRIZE_POOL_TICKET_TWAB_TOTAL_SUPPLY_QUERY_KEY
} from './usePrizePoolTicketTwabTotalSupply'

export const useAllPrizePoolTicketTwabTotalSupplies = () => {
  const prizePools = usePrizePools()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()
  const isAllTokensFetched = allPrizePoolTokensQueryResults.every(({ isFetched }) => isFetched)

  return useQueries(
    isAllTokensFetched
      ? prizePools.map((prizePool) => {
          const relatedQueryResult = allPrizePoolTokensQueryResults.find(
            (queryResult) => queryResult.data?.prizePoolId === prizePool?.id()
          )
          return {
            ...NO_REFETCH,
            queryKey: [
              PRIZE_POOL_TICKET_TWAB_TOTAL_SUPPLY_QUERY_KEY,
              prizePool?.id(),
              relatedQueryResult?.data.ticket.address
            ],
            queryFn: () =>
              getPrizePoolTicketTwabTotalSupply(prizePool, relatedQueryResult.data?.ticket),
            enabled: isAllTokensFetched
          }
        })
      : []
  )
}
