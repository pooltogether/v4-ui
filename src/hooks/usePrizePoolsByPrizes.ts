import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllPrizePoolTotalNumberOfPrizes } from './v4/PrizePool/useAllPrizePoolTotalNumberOfPrizes'
import { usePrizePools } from './v4/PrizePool/usePrizePools'

export const usePrizePoolsByPrizes = () => {
  const _prizePools = usePrizePools()
  const queryResults = useAllPrizePoolTotalNumberOfPrizes()
  return useMemo(() => {
    const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    let prizePools: PrizePool[] = []
    const sortedPrizePoolIds = queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => data)
      .sort((a, b) => b.numberOfPrizes - a.numberOfPrizes)
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
