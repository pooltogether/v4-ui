import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from '../PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '../PrizePool/usePrizePools'

export const usePrizePoolNetworkGrandPrize = () => {
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()

  return useMemo(() => {
    const isPrizeCountsFetched = queryResults.some(({ isFetched }) => isFetched)
    const isPrizeTiersFetched = queryResults.some(({ isFetched }) => isFetched)

    if (!isPrizeCountsFetched || !isPrizeTiersFetched) {
      return { data: null, isFetched: false }
    }

    let grandPrizeValue: Amount
    let prizePool: PrizePool
    queryResults.forEach(({ data, isFetched }) => {
      if (!isFetched) return
      if (!grandPrizeValue) {
        prizePool = prizePools.find((prizePool) => prizePool.id() === data.prizePoolId)
        grandPrizeValue = data.grandPrizeValue
      } else if (data.grandPrizeValue.amountUnformatted.gt(grandPrizeValue.amountUnformatted)) {
        prizePool = prizePools.find((prizePool) => prizePool.id() === data.prizePoolId)
        grandPrizeValue = data.grandPrizeValue
      }
    })

    return { data: { grandPrizeValue, prizePool }, isFetched: true }
  }, [prizePools, queryResults])
}
