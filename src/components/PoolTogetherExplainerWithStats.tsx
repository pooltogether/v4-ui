import { LargestPrizeInNetwork } from './PrizePoolNetwork/LargestPrizeInNetwork'
import { UpcomingPerDrawPrizeValue } from './PrizePoolNetwork/UpcomingPerDrawPrizeValue'

export const PoolTogetherExplainerWithStats = () => (
  <>
    When you deposit into a PoolTogether Prize Pool you'll have a <b>{'daily'}</b> chance to win
    prizes. There's{' '}
    <b className='text-flashy'>
      <UpcomingPerDrawPrizeValue />
    </b>{' '}
    to be won and everyone has a chance to win the <b>Grand Prize </b>of{' '}
    <b className='text-flashy'>
      <LargestPrizeInNetwork />
    </b>
    ! I know it sounds crazy, but it's true.
  </>
)
