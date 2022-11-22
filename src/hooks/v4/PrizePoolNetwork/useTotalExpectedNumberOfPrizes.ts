import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from '../PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '../PrizePool/usePrizePools'

export const useTotalExpectedNumberOfPrizes = () => {
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  return useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return { data: [], totalAmountOfPrizes: 0 }
    }
    const totalAmountOfPrizes = Math.round(
      queryResults
        .filter(({ isFetched, isError }) => isFetched && !isError)
        .reduce((sum, { data }) => sum + data.expectedTotalNumberOfPrizes, 0)
    )
    const data = queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          prizes: Math.round(data.expectedTotalNumberOfPrizes),
          percentage: data.expectedTotalNumberOfPrizes / totalAmountOfPrizes
        }
      })
      .sort((a, b) => b.prizes - a.prizes)
    return { totalAmountOfPrizes, data }
  }, [prizePools, queryResults])
}
