import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import FeatherIcon from 'feather-icons-react'
import { TokenIcon } from '@pooltogether/react-components'
import classNames from 'classnames'

interface PrizePoolDepositBalanceProps {
  chainId: number
  token: TokenWithUsdBalance | TokenWithBalance
}

export const PrizePoolDepositBalance = (props: PrizePoolDepositBalanceProps) => {
  const { chainId, token } = props

  let balanceToDisplay = token.amountPretty
  if (Boolean((token as TokenWithUsdBalance).balanceUsd)) {
    balanceToDisplay = `$${(token as TokenWithUsdBalance).balanceUsd.amountPretty}`
  }

  return (
    <div className='flex'>
      <TokenIcon chainId={chainId} address={token.address} className='mr-2 my-auto' />
      <span className={classNames('font-bold text-lg mr-3', { 'opacity-50': !token.hasBalance })}>
        {balanceToDisplay}
      </span>
      <FeatherIcon icon='chevron-right' className='my-auto h-8 w-8 opacity-50' />
    </div>
  )
}
