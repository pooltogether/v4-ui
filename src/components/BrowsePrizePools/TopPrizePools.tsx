import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { HorizontalListByPrizes } from './PrizePoolHorizontalList/HorizontalListByPrizes'
import { HorizontalListByTvl } from './PrizePoolHorizontalList/HorizontalListByTvl'

export const TopPrizePools: React.FC<{
  onClick: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onClick, marginClassName } = props
  return (
    <>
      <div className='flex flex-col'>
        <ListHeader>Total Value Locked</ListHeader>
        <HorizontalListByTvl onClick={onClick} marginClassName={marginClassName} />
      </div>
      <div className='flex flex-col'>
        <ListHeader>Expected Daily Prizes</ListHeader>
        <HorizontalListByPrizes onClick={onClick} marginClassName={marginClassName} />
      </div>
    </>
  )
}

const ListHeader: React.FC<{ className?: string }> = (props) => (
  <span {...props} className={classNames(props.className, 'text-sm mb-2 font-bold')} />
)
