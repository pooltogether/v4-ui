import { getCurrencyValue } from '@components/CurrencyValue'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const Prizes = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data, isFetched, isError } = usePrizePoolExpectedPrizes(prizePool)
  const { data: exchangeRates, isFetched: isFetchedExchangeRates } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  return isFetched && isFetchedExchangeRates && !isError ? (
    <>
      {data?.uniqueValueOfPrizesFormattedList
        .map((v) => getCurrencyValue(v, currency, exchangeRates, { hideZeroes: true }))
        .join(', ')}
    </>
  ) : null
}
