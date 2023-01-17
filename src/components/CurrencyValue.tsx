import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { CountUp } from '@pooltogether/react-components'
import { formatCurrencyNumberForDisplay } from '@pooltogether/utilities'
import { getCurrencySymbolById } from '@utils/getCurrencySymbolById'

interface CurrencyValueProps {
  usdValue: number | string
  countUp?: boolean
  decimals?: number
}

export const CurrencyValue = (props: CurrencyValueProps) => {
  const { usdValue, countUp, decimals } = props

  const { data: exchangeRates, isFetched } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  const symbol = getCurrencySymbolById(currency) ?? '$'

  if (isFetched && !!exchangeRates && !!exchangeRates[currency] && !!exchangeRates.usd) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = Number(usdValue) * currencyMultiplier
    return (
      <CurrencyValueDisplay
        value={currencyValue}
        currency={currency}
        symbol={symbol}
        countUp={countUp}
        decimals={decimals}
      />
    )
  } else {
    return <CurrencyValueDisplay value={0} currency={currency} symbol={symbol} />
  }
}

interface CurrencyValueDisplayProps {
  value: number
  currency: string
  symbol: string
  countUp?: boolean
  decimals?: number
}

const CurrencyValueDisplay = (props: CurrencyValueDisplayProps) => {
  const { value, currency, symbol, countUp, decimals } = props

  if (countUp) {
    return (
      <>
        {symbol}
        <CountUp countTo={value} decimals={decimals ?? 0} />
      </>
    )
  } else {
    return (
      <>
        {formatCurrencyNumberForDisplay(value, currency, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}
      </>
    )
  }
}

export const getStringCurrencyValue = (usdValue: number | string, decimals?: number) => {
  const { data: exchangeRates, isFetched } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  if (isFetched && !!exchangeRates && !!exchangeRates[currency] && !!exchangeRates.usd) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = Number(usdValue) * currencyMultiplier
    return formatCurrencyNumberForDisplay(currencyValue, currency, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  } else {
    return formatCurrencyNumberForDisplay(0, currency)
  }
}
