import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from '../PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '../PrizePool/usePrizePools'

export const usePrizePoolNetworkTotalAmountOfPrizes = () => {
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()

  return useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return { data: null, isFetched: false }
    }
    const totalAmountOfPrizes = Math.round(
      queryResults
        .filter(({ isFetched, isError, data }) => isFetched && !isError && !!data)
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
    return { data: { totalAmountOfPrizes, data }, isFetched: true }
  }, [queryResults])
}
