import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'

export const NumberOfPrizes = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data, isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return <>{isFetched ? Math.round(data?.expectedTotalNumberOfPrizes) : null}</>
}
