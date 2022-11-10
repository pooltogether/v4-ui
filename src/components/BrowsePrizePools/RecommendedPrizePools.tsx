import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { TopPoolByAvgPrizeValue } from './TopPool/TopPoolByAvgPrizeValue'
import { TopPoolByOdds } from './TopPool/TopPoolByOdds'
import { TopPoolByGas } from './TopPool/TopPoolByGas'
import { TopPoolByTvl } from './TopPool/TopPoolByTvl'

export const RecommendedPrizePools = (props: {
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}) => {
  const { onPrizePoolSelect, className } = props
  return (
    <div
      className={classNames(
        'grid gap-y-12 sm:gap-y-12 xs:gap-x-2 sm:gap-x-8 grid-cols-1 sm:grid-cols-2',
        className
      )}
    >
      <TopPoolByTvl
        onPrizePoolSelect={onPrizePoolSelect}
        className='flex flex-col justify-between h-full'
      />
      <TopPoolByOdds
        onPrizePoolSelect={onPrizePoolSelect}
        className='flex flex-col justify-between h-full'
      />
      <TopPoolByAvgPrizeValue
        onPrizePoolSelect={onPrizePoolSelect}
        className='flex flex-col justify-between h-full'
      />
      <TopPoolByGas
        onPrizePoolSelect={onPrizePoolSelect}
        className='flex flex-col justify-between h-full'
      />
    </div>
  )
}
