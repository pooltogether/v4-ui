import React from 'react'
import classNames from 'classnames'
import { Token } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'

interface TokenSymbolAndIconProps {
  token: Token
  chainId: number
  className?: string
  sizeClassName?: string
}

export const TokenSymbolAndIcon = (props: TokenSymbolAndIconProps) => {
  const { className, chainId, sizeClassName, token } = props

  if (!token) return null

  return (
    <div className={classNames('flex items-center', className)}>
      <TokenIcon
        sizeClassName={sizeClassName}
        className='mr-2'
        chainId={chainId}
        address={token.address}
      />
      <span className=''>{token.symbol}</span>
    </div>
  )
}
