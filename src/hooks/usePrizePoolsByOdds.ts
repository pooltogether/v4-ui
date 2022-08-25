import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromString } from '@utils/getAmountFromString'
import { useMemo } from 'react'

import { useAllPrizePoolOdds } from './v4/PrizePool/useAllPrizePoolOdds'
import { usePrizePools } from './v4/PrizePool/usePrizePools'

export const usePrizePoolsByOdds = (amount: string, decimals: string) => {
  const _prizePools = usePrizePools()

  const queryResults = useAllPrizePoolOdds(
    _prizePools.reduce((twabs, prizePool) => {
      twabs[prizePool.id()] = getAmountFromString(amount, decimals)
      return twabs
    }, {} as { [prizePoolId: string]: Amount })
  )

  return useMemo(() => {
    const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    let prizePools: PrizePool[] = []
    const sortedPrizePoolIds = queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => data)
      .sort((a, b) => b.odds - a.odds)
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
