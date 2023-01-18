import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { CountUp } from '@pooltogether/react-components'
import { formatCurrencyNumberForDisplay } from '@pooltogether/utilities'
import { getCurrencySymbolById } from '@utils/getCurrencySymbolById'
import { useExchangeRates } from '../serverAtoms'

interface CurrencyValueProps {
  usdValue: number | string
  options?: CurrencyFormattingOptions
}

type CurrencyFormattingOptions = Omit<Intl.NumberFormatOptions, 'style' | 'currency'> & {
  countUp?: boolean
  decimals?: number
  locale?: string
  round?: boolean
  hideZeroes?: boolean
}

// TODO: search for other places in the app that require switching to this component (search for countup, amountpretty, formatUnformattedBigNumberForDisplay, etc.)
// TODO: investigate options to generalize this for the future where we may have ETH as the base currency instead of USD
export const CurrencyValue = (props: CurrencyValueProps) => {
  const { usdValue, options } = props

  const exchangeRates = useExchangeRates()
  const { currency } = useSelectedCurrency()

  const symbol = getCurrencySymbolById(currency) ?? '$'

  if (!!exchangeRates && !!exchangeRates[currency] && !!exchangeRates.usd) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = Number(usdValue) * currencyMultiplier
    return (
      <CurrencyValueDisplay
        value={currencyValue}
        currency={currency}
        symbol={symbol}
        options={options}
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
  options?: CurrencyFormattingOptions
}

const CurrencyValueDisplay = (props: CurrencyValueDisplayProps) => {
  const { value, currency, symbol, options } = props

  if (options?.countUp) {
    return (
      <>
        {symbol}
        <CountUp countTo={value} decimals={options?.decimals ?? 0} />
      </>
    )
  } else {
    return <>{formatCurrencyNumberForDisplay(value, currency, options)}</>
  }
}

// TODO: refactor this to avoid duplicate code
export const getCurrencyValue = (
  usdValue: number | string,
  currency: string,
  exchangeRates: Record<string, { value: number }>,
  options?: CurrencyFormattingOptions
) => {
  if (!!exchangeRates && !!exchangeRates[currency] && !!exchangeRates.usd) {
    const currencyMultiplier = exchangeRates[currency].value / exchangeRates.usd.value
    const currencyValue = Number(usdValue) * currencyMultiplier
    return formatCurrencyNumberForDisplay(currencyValue, currency, options)
  } else {
    return formatCurrencyNumberForDisplay(0, currency)
  }
}
