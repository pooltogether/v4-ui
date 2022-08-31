import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { PrizePoolHorizontalList } from '.'
import { TotalValueLocked } from '../../PrizePoolCard'

export const HorizontalListByTvl: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onPrizePoolSelect, className, marginClassName } = props
  const { isPartiallyFetched, isFetched, prizePools } = usePrizePoolsByTvl()

  return (
    <div className={classNames(className, 'space-y-2')}>
      <span className='font-bold text-lg'>Popular</span>
      <PrizePoolHorizontalList
        label='by-tvl'
        marginClassName={marginClassName}
        onPrizePoolSelect={onPrizePoolSelect}
        prizePools={prizePools}
        isPartiallyFetched={isPartiallyFetched}
        isFetched={isFetched}
        prizePoolCardContent={({ prizePool }) => <TotalValueLocked prizePool={prizePool} />}
      />
    </div>
  )
}
