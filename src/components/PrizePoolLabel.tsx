import { usePrizePoolTokens } from '@pooltogether/hooks'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const PrizePoolLabel = (props: { prizePool: PrizePool; fontSizeClassName?: string }) => {
  const { prizePool, fontSizeClassName } = props
  const { data: tokens } = usePrizePoolTokens(prizePool)

  return (
    <div className={classNames('flex space-x-2 items-center', fontSizeClassName)}>
      <TokenIcon address={tokens?.token.address} chainId={prizePool.chainId} />
      <span className='font-bold'>{tokens?.token.symbol}</span>
      <NetworkIcon chainId={prizePool.chainId} />
      <span className='font-bold'>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
      <span className=''>{shorten({ hash: prizePool.address, short: true })}</span>
    </div>
  )
}

PrizePoolLabel.defaultProps = {
  fontSizeClassName: 'xs:text-lg'
}
