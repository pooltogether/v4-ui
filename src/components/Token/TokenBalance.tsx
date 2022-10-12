import { Token, TokenWithUsdBalance } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'

export const TokenBalance = (props: {
  chainId: number
  token: Token & Partial<TokenWithUsdBalance>
  showTokenIcon?: boolean
  iconSizeClassName?: string
  iconClassName?: string
}) => {
  const { chainId, token, showTokenIcon, iconClassName, iconSizeClassName } = props
  if (!!token?.balanceUsd) {
    return <>${token.balanceUsd.amountPretty}</>
  } else {
    return (
      <>
        {showTokenIcon && (
          <TokenIcon
            chainId={chainId}
            address={token?.address}
            className={iconClassName}
            sizeClassName={iconSizeClassName}
          />
        )}
        {token?.amountPretty} {token?.symbol}
      </>
    )
  }
}

TokenBalance.defaultProps = {
  showTokenIcon: true,
  iconSizeClassName: 'w-4 h-4',
  iconClassName: 'mr-1 my-auto'
}
