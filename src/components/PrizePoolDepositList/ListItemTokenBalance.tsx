import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

interface ListItemTokenBalanceProps {
  chainId: number
  token: TokenWithUsdBalance | TokenWithBalance
  error?: boolean
}

export const ListItemTokenBalance = (props: ListItemTokenBalanceProps) => {
  const { chainId, token, error } = props
  const { t } = useTranslation()

  let balanceToDisplay = token?.amountPretty
  if (
    !!token &&
    (token as TokenWithUsdBalance).balanceUsdScaled &&
    !(token as TokenWithUsdBalance).balanceUsdScaled.isZero()
  ) {
    balanceToDisplay = `$${(token as TokenWithUsdBalance).balanceUsd.amountPretty}`
  }

  return (
    <div className='flex items-center'>
      {!!token ? (
        <>
          <TokenIcon chainId={chainId} address={token.address} className='mr-2' />
          <span
            className={classNames('leading-none font-bold text-sm xs:text-lg', {
              'opacity-50': !token.hasBalance
            })}
          >
            {balanceToDisplay}
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
