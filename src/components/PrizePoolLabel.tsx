import { usePrizePoolTokens } from '@pooltogether/hooks'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const PrizePoolLabel = (props: { prizePool: PrizePool; fontSizeClassName?: string }) => {
  const { prizePool, fontSizeClassName } = props
  const { data: tokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  return (
    <div className={classNames('flex space-x-2 items-center', fontSizeClassName)}>
      {isPrizePoolTokensFetched && (
        <TokenIcon
          address={tokens.token.address}
          chainId={prizePool.chainId}
          sizeClassName='w-8 h-8'
        />
      )}
      <div className='flex flex-col'>
        <div className='font-bold'>{tokens?.token.symbol}</div>
        <div className='text-xxxs flex space-x-1 items-center'>
          <NetworkIcon chainId={prizePool.chainId} sizeClassName='w-3 h-3' />
          <span className='font-bold'>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
          <span className=''>{shorten({ hash: prizePool.address, short: true })}</span>
        </div>
      </div>
    </div>
  )
}

PrizePoolLabel.defaultProps = {
  fontSizeClassName: 'xs:text-lg'
}
