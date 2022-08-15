import { useSelectedPrizePools } from '@hooks/useSelectedPrizePools'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const TopPoolsHorizontalList: React.FC<{
  className?: string
  marginClassName?: string
  selectPrizePool: (prizePool: PrizePool) => void
}> = (props) => {
  const { selectPrizePool, className, marginClassName } = props
  const prizePools = useSelectedPrizePools()

  return (
    <div
      className={classNames('overflow-x-auto minimal-scrollbar pb-2', className, marginClassName)}
    >
      <ul className={classNames('space-x-4 flex w-max')}>
        {prizePools.map((prizePool) => (
          <PrizePoolCard
            key={`horizontal-pools-list-${prizePool.id()}`}
            prizePool={prizePool}
            selectPrizePool={selectPrizePool}
          />
        ))}
      </ul>
    </div>
  )
}

const PrizePoolCard: React.FC<{
  prizePool: PrizePool
  selectPrizePool: (prizePool: PrizePool) => void
}> = (props) => {
  const { prizePool, selectPrizePool } = props
  const { data: tokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  return (
    <button
      onClick={() => selectPrizePool(prizePool)}
      className='bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-xl px-3 py-4 text-left w-64'
    >
      <div className='flex space-x-2'>
        {isPrizePoolTokensFetched && (
          <>
            <TokenIcon
              address={tokens.token.address}
              chainId={prizePool.chainId}
              sizeClassName='w-8 h-8'
            />
            <CardLabelLarge>{tokens.token.symbol}</CardLabelLarge>
          </>
        )}
      </div>
      <div className='flex flex-col'>
        <CardLabelSmall>Weekly chances per $1,000 deposit</CardLabelSmall>
        <CardLabelLarge>1:45</CardLabelLarge>
      </div>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <CardLabelSmall>Yield source</CardLabelSmall>
          <CardLabelMedium>{shorten({ hash: prizePool.address })}</CardLabelMedium>
        </div>
        <div className='flex flex-col'>
          <CardLabelSmall>Network</CardLabelSmall>
          <CardLabelMedium>{getNetworkNiceNameByChainId(prizePool.chainId)}</CardLabelMedium>
        </div>
      </div>
    </button>
  )
}

const CardLabelSmall = (props) => (
  <span {...props} className={classNames('text-xxs opacity-70', props.className)} />
)

const CardLabelMedium = (props) => (
  <span {...props} className={classNames('text-xxs', props.className)} />
)

const CardLabelLarge = (props) => (
  <span {...props} className={classNames('text-xl font-bold', props.className)} />
)
