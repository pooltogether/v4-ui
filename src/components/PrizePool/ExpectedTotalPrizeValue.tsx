import { CurrencyValue } from '@components/CurrencyValue'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const ExpectedTotalPrizeValue = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data, isFetched, isError } = usePrizePoolExpectedPrizes(prizePool)
  return isFetched && !isError ? (
    <CurrencyValue baseValue={data?.expectedTotalValueOfPrizes.amount} />
  ) : null
}
