import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { CountUp } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
// import { useQuery, UseQueryResult } from 'react-query'

interface CurrencyValueProps {
  value: number
  countUp?: boolean
  decimals?: number
  precision?: number
}

export const CurrencyValue = (props: CurrencyValueProps) => {
  const { value, countUp, decimals, precision } = props

  const { data: exchangeRates, isFetched } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  if (
    !!value &&
    isFetched &&
    currency !== 'usd' &&
    !!exchangeRates &&
    !!exchangeRates[currency] &&
    !!exchangeRates.usd
  ) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = value * currencyMultiplier
    const symbol = exchangeRates[currency].unit
    return (
      <CurrencyValueDisplay
        value={currencyValue}
        symbol={symbol}
        countUp={countUp}
        decimals={decimals}
        precision={precision}
      />
    )
  } else {
    return (
      <CurrencyValueDisplay
        value={value}
        symbol={'$'}
        countUp={countUp}
        decimals={decimals}
        precision={precision}
      />
    )
  }
}

const CurrencyValueDisplay = (props: CurrencyValueProps & { symbol: string }) => {
  const { value: currencyValue, symbol, countUp, decimals, precision } = props

  return (
    <>
      {symbol}
      {countUp ? (
        <CountUp countTo={currencyValue} decimals={decimals ?? 0} />
      ) : (
        numberWithCommas(currencyValue, { decimals, precision })
      )}
    </>
  )
}

// TODO: REMOVE THIS AFTER TESTING (IMPORT FROM HOOKS PACKAGE)
// interface CoingeckoExchangeRates {
//   [id: string]: {
//     name: string
//     unit: string
//     value: number
//     type: 'crypto' | 'fiat' | 'commodity'
//   }
// }
// export const useCoingeckoExchangeRates = (): UseQueryResult<CoingeckoExchangeRates, unknown> => {
//   return useQuery(['getCoingeckoExchangeRates'], async () => await getCoingeckoExchangeRates(), {
//     staleTime: Infinity,
//     enabled: true,
//     refetchInterval: false,
//     refetchIntervalInBackground: false,
//     refetchOnMount: false,
//     refetchOnReconnect: false,
//     refetchOnWindowFocus: false
//   })
// }
// const getCoingeckoExchangeRates = async () => {
//   try {
//     const url = new URL(`https://api.coingecko.com/api/v3/exchange_rates`)
//     const response = await fetch(url.toString())
//     const exchangeRates = (await response.json()).rates

//     return exchangeRates
//   } catch (e) {
//     console.error(e.message)
//     return undefined
//   }
// }
