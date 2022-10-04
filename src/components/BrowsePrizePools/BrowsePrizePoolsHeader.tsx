import { LargestPrizeInNetwork } from '@components/PrizePoolNetwork/LargestPrizeInNetwork'
import { TotalNumberOfPrizes } from '@components/PrizePoolNetwork/TotalNumberOfPrizes'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import classNames from 'classnames'

export const BrowsePrizePoolsHeader: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  return (
    <div className={classNames(className)}>
      <div className='flex justify-between mb-2 items-center'>
        <div className='font-bold text-xl'>Explore Prize Pools</div>
      </div>
      <div className='opacity-80'>
        When you deposit into a PoolTogether Prize Pool you'll have a <b>{'daily'}</b> chance to win
        some of the{' '}
        <b className='animate-rainbow'>
          <TotalNumberOfPrizes />
        </b>{' '}
        prizes. There's{' '}
        <b className='animate-rainbow'>
          <UpcomingPerDrawPrizeValue />
        </b>{' '}
        to be won and everyone has a chance to win the <b>Grand Prize </b>of{' '}
        <b className='animate-rainbow'>
          <LargestPrizeInNetwork />
        </b>
        ! I know it sounds crazy, but it's true.
      </div>
    </div>
  )
}
