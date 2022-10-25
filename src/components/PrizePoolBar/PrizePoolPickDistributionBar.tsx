import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useMemo } from 'react'
import { PrizePoolBar } from '.'

export const PrizePoolPickDistributionBar: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  const data = useMemo(() => {
    const isFetched = queryResults.every(({ isFetched }) => isFetched)
    if (!isFetched) {
      return null
    }
    return queryResults
      .map(({ data }) => data)
      .map(({ prizePoolId, percentageOfPicks }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === prizePoolId),
          percentage: percentageOfPicks
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [queryResults])
  return <PrizePoolBar data={data} className={className} />
}
