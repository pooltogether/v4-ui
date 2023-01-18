import { CurrencyValue } from '@components/CurrencyValue'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const GrandPrize = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data, isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return isFetched ? (
    <CurrencyValue usdValue={data?.grandPrizeValue.amount} options={{ hideZeroes: true }} />
  ) : null
}
