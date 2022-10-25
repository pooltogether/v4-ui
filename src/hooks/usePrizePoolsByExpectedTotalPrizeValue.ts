import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from './v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from './v4/PrizePool/usePrizePools'

export const usePrizePoolsByExpectedTotalPrizeValue = () => {
  const _prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  return useMemo(() => {
    const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    let prizePools: PrizePool[] = []
    const sortedPrizePoolIds = queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => data)
      .sort((a, b) =>
        a.expectedTotalValueOfPrizes.amountUnformatted.gte(
          b.expectedTotalValueOfPrizes.amountUnformatted
        )
          ? -1
          : 1
      )
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
