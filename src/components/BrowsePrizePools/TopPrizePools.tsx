import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { HorizontalListByOdds } from './PrizePoolHorizontalList/HorizontalListByOdds'
import { HorizontalListByTvl } from './PrizePoolHorizontalList/HorizontalListByTvl'

export const TopPrizePools: React.FC<{
  onPrizePoolSelect: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onPrizePoolSelect, marginClassName } = props
  return (
    <div className='space-y-16'>
      <HorizontalListByTvl
        onPrizePoolSelect={onPrizePoolSelect}
        marginClassName={marginClassName}
      />
      <HorizontalListByOdds
        onPrizePoolSelect={onPrizePoolSelect}
        marginClassName={marginClassName}
      />
    </div>
  )
}

const ListHeader: React.FC<{ className?: string }> = (props) => (
  <span {...props} className={classNames(props.className, 'text-sm mb-2 font-bold')} />
)
