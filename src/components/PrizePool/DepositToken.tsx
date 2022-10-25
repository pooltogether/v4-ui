import { usePrizePoolTokens } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'

export const DepositToken = (props: {
  prizePool: PrizePool
  showTokenIcon?: boolean
  iconSizeClassName?: string
  iconClassName?: string
}) => {
  const { prizePool, showTokenIcon, iconSizeClassName, iconClassName } = props
  const { data: tokens } = usePrizePoolTokens(prizePool)
  return (
    <>
      {showTokenIcon && (
        <TokenIcon
          chainId={prizePool.chainId}
          address={tokens?.token.address}
          className={iconClassName}
          sizeClassName={iconSizeClassName}
        />
      )}
      {tokens?.token.symbol}
    </>
  )
}

DepositToken.defaultProps = {
  iconSizeClassName: 'w-4 h-4',
  iconClassName: 'mr-1 my-auto'
}
