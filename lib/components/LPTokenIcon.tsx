import { Token } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import classNames from 'classnames'

interface LPTokenIconProps {
  className?: string
  sizeClassName?: string
  chainId: number
  token1Address: string
  token2Address: string
}

export const LPTokenIcon = (props: LPTokenIconProps) => {
  const { className, sizeClassName, chainId, token1Address, token2Address } = props
  return (
    <div className={className}>
      <TokenIcon sizeClassName={sizeClassName} chainId={chainId} address={token1Address} />
      <TokenIcon
        className='-ml-2'
        sizeClassName={sizeClassName}
        chainId={chainId}
        address={token2Address}
      />
    </div>
  )
}
