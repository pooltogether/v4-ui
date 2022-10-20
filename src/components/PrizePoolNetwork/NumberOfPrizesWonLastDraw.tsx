import { useAllLatestDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { useMemo } from 'react'

export const NumberOfPrizesWonLastDraw = () => {
  const queryResults = useAllLatestDrawWinnersInfo()
  const numberOfPrizesWonLastDraw = useMemo(
    () =>
      queryResults.reduce((total, { data, isFetched, isError }) => {
        if (!isFetched || isError) {
          return total
        }
        return total + data.prizesWon
      }, 0),
    [queryResults]
  )
  return <>{numberOfPrizesWonLastDraw}</>
}
