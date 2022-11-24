import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllPrizePoolTicketTwabTotalSupplies } from './v4/PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { usePrizePools } from './v4/PrizePool/usePrizePools'

export const usePrizePoolsByTvl = () => {
  const _prizePools = usePrizePools()
  const queryResults = useAllPrizePoolTicketTwabTotalSupplies()
  return useMemo(() => {
    const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    let prizePools: PrizePool[] = []
    const sortedPrizePoolIds = queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .map(({ data }) => data)
      .sort((a, b) => (a.amount.amountUnformatted.gte(b.amount.amountUnformatted) ? -1 : 1))
      .map(({ prizePoolId }) => prizePoolId)
    prizePools = sortedPrizePoolIds.map((prizePoolId) =>
      _prizePools.find((prizePool) => prizePool.id() === prizePoolId)
    )
    return {
      isFetched,
      isPartiallyFetched,
      prizePools
    }
  }, [queryResults, _prizePools])
}
