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
  const isAllTokensFetched = allPrizePoolTokensQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  return useQueries(
    prizePools.map((prizePool) => {
      const relatedQueryResult = allPrizePoolTokensQueryResults.find(
        (queryResult) => queryResult.data?.prizePoolId === prizePool?.id()
      )
      return {
        queryKey: [PRIZE_POOL_TICKET_TWAB_TOTAL_SUPPLY_QUERY_KEY, prizePool?.id()],
        queryFn: () =>
          getPrizePoolTicketTwabTotalSupply(prizePool, relatedQueryResult.data?.ticket),
        enabled: !!isAllTokensFetched
      }
    })
  )
}
