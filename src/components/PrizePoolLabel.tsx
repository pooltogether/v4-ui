import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import {
  getYieldSourceNiceName,
  NetworkIcon,
  TokenIcon,
  YieldSourceIcon,
  YieldSourceKey
} from '@pooltogether/react-components'
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
        <div className='text-xxxs flex space-x-2 items-center font-normal'>
          <div className='flex space-x-1 items-center'>
            <NetworkIcon chainId={prizePool.chainId} sizeClassName='w-3 h-3' />
            <span className='opacity-80'>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
          </div>
          {/* <div className='flex space-x-1 items-center'>
            <YieldSourceIcon yieldSource={YieldSourceKey.aave} sizeClassName='w-3 h-3' />
            <span className='opacity-90'>{getYieldSourceNiceName(YieldSourceKey.aave)}</span>
          </div> */}
        </div>
      </div>
    </div>
  )
}

PrizePoolLabel.defaultProps = {
  fontSizeClassName: 'xs:text-lg'
}

export const PrizePoolLabelFlat: React.FC<{
  prizePool: PrizePool
  className?: string
  fontSizeClassName?: string
}> = (props) => {
  const { prizePool, className, fontSizeClassName } = props
  const { data: tokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  return (
    <div
      className={classNames(
        'flex space-x-2 xs:space-x-3 xs:space-x-3 items-center',
        className,
        fontSizeClassName
      )}
    >
      <div className='flex space-x-1 items-center'>
        {isPrizePoolTokensFetched && (
          <TokenIcon
            address={tokens.token.address}
            chainId={prizePool.chainId}
            sizeClassName='w-5 h-5 xs:w-6 xs:h-6'
          />
        )}
        <div className='font-bold'>{tokens?.token.symbol}</div>
      </div>
      <div className='flex space-x-1 items-center'>
        <NetworkIcon chainId={prizePool.chainId} sizeClassName='w-5 h-5 xs:w-6 xs:h-6' />
        <span className='opacity-70'>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
      </div>
      {/* <div className='flex space-x-1 items-center'>
        <YieldSourceIcon yieldSource={YieldSourceKey.aave} sizeClassName='w-5 h-5 xs:w-6 xs:h-6' />
        <span className='opacity-70'>{getYieldSourceNiceName(YieldSourceKey.aave)}</span>
      </div> */}
    </div>
  )
}

PrizePoolLabelFlat.defaultProps = {
  fontSizeClassName: 'xs:text-lg'
}
