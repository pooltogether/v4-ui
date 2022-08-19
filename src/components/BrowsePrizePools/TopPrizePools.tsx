import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { HorizontalListByOdds } from './PrizePoolHorizontalList/HorizontalListByOdds'
import { HorizontalListByTvl } from './PrizePoolHorizontalList/HorizontalListByTvl'

export const TopPrizePools: React.FC<{
  onClick: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onClick, marginClassName } = props
  return (
    <div className='space-y-16'>
      <HorizontalListByTvl onPrizePoolSelect={onClick} marginClassName={marginClassName} />
      <HorizontalListByOdds onPrizePoolSelect={onClick} marginClassName={marginClassName} />
    </div>
  )
}

const ListHeader: React.FC<{ className?: string }> = (props) => (
  <span {...props} className={classNames(props.className, 'text-sm mb-2 font-bold')} />
)
