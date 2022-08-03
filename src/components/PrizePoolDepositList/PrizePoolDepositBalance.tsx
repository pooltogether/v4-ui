import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import FeatherIcon from 'feather-icons-react'
import { TokenIcon } from '@pooltogether/react-components'
import classNames from 'classnames'

interface PrizePoolDepositBalanceProps {
  chainId: number
  token: TokenWithUsdBalance | TokenWithBalance
  hideIcon?: boolean
  icon?: string
}

export const PrizePoolDepositBalance = (props: PrizePoolDepositBalanceProps) => {
  const { chainId, token, icon, hideIcon } = props

  let balanceToDisplay = token.amountPretty
  if (
    (token as TokenWithUsdBalance).balanceUsdScaled &&
    !(token as TokenWithUsdBalance).balanceUsdScaled.isZero()
  ) {
    balanceToDisplay = `$${(token as TokenWithUsdBalance).balanceUsd.amountPretty}`
  }

  return (
    <div className='flex items-center'>
      <TokenIcon chainId={chainId} address={token.address} className='mr-2' />
      <span
        className={classNames('leading-none font-bold mr-3', {
          'opacity-50': !token.hasBalance
        })}
      >
        {balanceToDisplay}
      </span>
      {!hideIcon && <FeatherIcon icon={icon} className='my-auto w-6 h-6 opacity-50' />}
    </div>
  )
}

PrizePoolDepositBalance.defaultProps = {
  icon: 'chevron-right'
}
