import { useSelectedPrizePools } from '@hooks/useSelectedPrizePools'
import { useGaugeController } from '@hooks/v4/Gauge/useGaugeControllers'
import { useUsersGaugeControllerBalance } from '@hooks/v4/Gauge/useUsersGaugeControllerBalance'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'

export const TopPoolGaugesHorizontalList: React.FC<{
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
          <PrizePoolGaugeCard
            key={`horizontal-pools-list-${prizePool.id()}`}
            prizePool={prizePool}
            selectPrizePool={selectPrizePool}
          />
        ))}
      </ul>
    </div>
  )
}

const PrizePoolGaugeCard: React.FC<{
  prizePool: PrizePool
  selectPrizePool: (prizePool: PrizePool) => void
}> = (props) => {
  const { prizePool, selectPrizePool } = props
  const { data: tokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: gaugeController } = useGaugeController(prizeDistributor)
  const usersAddress = useUsersAddress()
  const { data: gaugeStakedBalance } = useUsersGaugeControllerBalance(usersAddress, gaugeController)

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
        <CardLabelSmall>Gauge APR</CardLabelSmall>
        <CardLabelLarge>8%</CardLabelLarge>
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
