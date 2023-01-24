import { formatCurrencyValue } from '@components/CurrencyValue'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import {
  TokenWithBalance,
  TokenWithUsdBalance,
  useCoingeckoExchangeRates
} from '@pooltogether/hooks'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

/**
 * TODO: Assumes stablecoins
 * @param props
 * @returns
 */
export const AccountListItemTokenBalance = (props: {
  chainId: number
  token: TokenWithUsdBalance | TokenWithBalance
  error?: boolean
}) => {
  const { chainId, token, error } = props
  const { data: exchangeRates, isFetched: isFetchedExchangeRates } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()
  const { t } = useTranslation()

  let balanceToDisplay = token?.amountPretty
  if (
    !!token &&
    !!(token as TokenWithUsdBalance).balanceUsd.amountPretty &&
    !(token as TokenWithUsdBalance).balanceUsd.amountUnformatted.isZero()
  ) {
    balanceToDisplay = formatCurrencyValue(
      (token as TokenWithUsdBalance).balanceUsd.amount,
      currency,
      exchangeRates,
      { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    )
  }

  return (
    <div className='flex items-center'>
      {!!token && !!isFetchedExchangeRates ? (
        <>
          {/* <TokenIcon chainId={chainId} address={token.address} className='mr-2' /> */}
          <span
            className={classNames('leading-none font-bold text-sm xs:text-lg', {
              'opacity-50': !token.hasBalance
            })}
          >
            {!!token ? balanceToDisplay : <ThemedClipSpinner />}
          </span>
        </>
      ) : error ? (
        <span className='text-pt-red-light'>{t('error')}</span>
      ) : (
        <ThemedClipSpinner sizeClassName='w-5 h-5' />
      )}
    </div>
  )
}
