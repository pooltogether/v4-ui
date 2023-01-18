import { CURRENCY_ID } from '@constants/currencies'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { CoingeckoExchangeRates } from '@pooltogether/hooks'
import { CountUp } from '@pooltogether/react-components'
import { formatCurrencyNumberForDisplay } from '@pooltogether/utilities'
import { getCurrencySymbolById } from '@utils/getCurrencySymbolById'
import { useExchangeRates } from '../serverAtoms'

interface CurrencyValueProps {
  baseValue: number | string
  options?: CurrencyFormattingOptions
}

type CurrencyFormattingOptions = Omit<Intl.NumberFormatOptions, 'style' | 'currency'> & {
  baseCurrency?: CURRENCY_ID
  countUp?: boolean
  hideCountUpSymbol?: boolean
  decimals?: number
  locale?: string
  round?: boolean
  hideZeroes?: boolean
}

/**
 * This component renders a JSX element with a currency value depending on the currency selected by the user.
 * - Assumes base currency is USD unless otherwise specified.
 * @param props
 * @returns
 */
export const CurrencyValue = (props: CurrencyValueProps) => {
  const { baseValue, options } = props

  const exchangeRates = useExchangeRates()
  const { currency } = useSelectedCurrency()

  const symbol = getCurrencySymbolById(currency) ?? '$'
  const currencyValue = calculateCurrencyValue(baseValue, currency, exchangeRates, {
    baseCurrency: options?.baseCurrency
  })

  if (options?.countUp) {
    return (
      <>
        {!options?.hideCountUpSymbol && symbol}
        <CountUp countTo={currencyValue} decimals={options?.decimals ?? 0} />
      </>
    )
  } else {
    return <>{formatCurrencyNumberForDisplay(currencyValue, currency, options)}</>
  }
}

/**
 * This function returns a converted currency value in string form.
 * - Assumed base currency is USD unless otherwise specified.
 * @param baseValue
 * @param currency
 * @param exchangeRates
 * @param options
 * @returns
 */
export const formatCurrencyValue = (
  baseValue: number | string,
  currency: CURRENCY_ID,
  exchangeRates: CoingeckoExchangeRates,
  options?: CurrencyFormattingOptions
) => {
  const currencyValue = calculateCurrencyValue(baseValue, currency, exchangeRates, {
    baseCurrency: options?.baseCurrency
  })
  return formatCurrencyNumberForDisplay(currencyValue, currency, options)
}

/**
 * This function converts a currency value to any other available currency.
 * @param baseValue
 * @param currency
 * @param exchangeRates
 * @param options
 * @returns
 */
const calculateCurrencyValue = (
  baseValue: number | string,
  currency: CURRENCY_ID,
  exchangeRates: CoingeckoExchangeRates,
  options?: { baseCurrency?: string }
) => {
  if (!!exchangeRates && !!exchangeRates[currency]) {
    const baseCurrencyValue = options?.baseCurrency
      ? exchangeRates[options.baseCurrency]?.value
      : exchangeRates.usd?.value
    if (!!baseCurrencyValue) {
      const currencyMultiplier = exchangeRates[currency].value / baseCurrencyValue
      const currencyValue = Number(baseValue) * currencyMultiplier
      return currencyValue
    }
  }

  return 0
}
