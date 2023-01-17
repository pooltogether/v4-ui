import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { CountUp } from '@pooltogether/react-components'
import { formatCurrencyNumberForDisplay } from '@pooltogether/utilities'
import { getCurrencySymbolById } from '@utils/getCurrencySymbolById'

interface CurrencyValueProps {
  usdValue: number | string
  countUp?: boolean
  decimals?: number
  hideZeroes?: boolean
  notation?: Intl.NumberFormatOptions['notation']
}

export const CurrencyValue = (props: CurrencyValueProps) => {
  const { usdValue, countUp, decimals, hideZeroes, notation } = props

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
        hideZeroes={hideZeroes}
        notation={notation}
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
  hideZeroes?: boolean
  notation?: Intl.NumberFormatOptions['notation']
}

const CurrencyValueDisplay = (props: CurrencyValueDisplayProps) => {
  const { value, currency, symbol, countUp, decimals, hideZeroes, notation } = props

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
          maximumFractionDigits: decimals,
          hideZeroes: hideZeroes,
          notation: notation ?? 'standard'
        })}
      </>
    )
  }
}

export const getCurrencyValue = (
  usdValue: number | string,
  currency: string,
  exchangeRates: Record<string, { value: number }>,
  options?: {
    decimals?: number
    hideZeroes?: boolean
    notation?: Intl.NumberFormatOptions['notation']
  }
) => {
  if (!!exchangeRates && !!exchangeRates[currency] && !!exchangeRates.usd) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = Number(usdValue) * currencyMultiplier
    return formatCurrencyNumberForDisplay(currencyValue, currency, {
      minimumFractionDigits: options?.decimals,
      maximumFractionDigits: options?.decimals,
      hideZeroes: options?.hideZeroes,
      notation: options?.notation ?? 'standard'
    })
  } else {
    return formatCurrencyNumberForDisplay(0, currency)
  }
}
