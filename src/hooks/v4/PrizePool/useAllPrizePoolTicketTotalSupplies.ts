import { useQueries } from 'react-query'
import { useAllPrizePoolTokens } from './useAllPrizePoolTokens'
import { usePrizePools } from './usePrizePools'
import {
  getPrizePoolTicketTotalSupply,
  getPrizePoolTicketTotalSupplyQueryKey
} from './usePrizePoolTicketTotalSupply'

export const useAllPrizePoolTicketTotalSupplies = () => {
  const prizePools = usePrizePools()
  const allPrizePoolTokensQueryResults = useAllPrizePoolTokens()
  const isAllTokensFetched = allPrizePoolTokensQueryResults.every(({ isFetched }) => isFetched)

  return useQueries(
    prizePools.map((prizePool) => {
      const relatedQueryResult = allPrizePoolTokensQueryResults.find(
        (queryResult) => queryResult.data?.prizePoolId === prizePool?.id()
      )
      return {
        queryKey: getPrizePoolTicketTotalSupplyQueryKey(prizePool),
        queryFn: () =>
          getPrizePoolTicketTotalSupply(prizePool, relatedQueryResult.data?.ticket.decimals),
        enabled: isAllTokensFetched
      }
    })
  )
}
