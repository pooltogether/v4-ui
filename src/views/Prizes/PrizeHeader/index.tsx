import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { TransparentDiv } from '@components/TransparentDiv'
import { CheckedState, PrizePageState } from '@hooks/v4/usePrizePageState'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { Countdown } from './Countdown'
import { DrawLabel } from './DrawLabel'
import { Title } from './Title'

export const PrizeHeader = (props: {
  usersAddress: string
  prizeDistributor: PrizeDistributor
  prizePageState: PrizePageState
  checkedState: CheckedState
  className?: string
}) => {
  const { className, usersAddress, prizeDistributor, prizePageState, checkedState } = props
  return (
    <div className={classNames(className, 'w-full flex-col justify-center py-4 xs:py-10 sm:py-0')}>
      <Title
        className='max-w-sm md:max-w-lg mx-auto'
        usersAddress={usersAddress}
        prizeDistributor={prizeDistributor}
        prizePageState={prizePageState}
        checkedState={checkedState}
      />
      <TransparentDiv className='rounded-xl w-full xs:max-w-screen-xs mx-auto mt-8 xs:mt-12 p-5 flex flex-col'>
        <DrawLabel
          className='mx-auto mb-4'
          usersAddress={usersAddress}
          prizeDistributor={prizeDistributor}
          prizePageState={prizePageState}
          checkedState={checkedState}
        />
        <Countdown
          className='mx-auto'
          usersAddress={usersAddress}
          prizeDistributor={prizeDistributor}
          prizePageState={prizePageState}
          checkedState={checkedState}
        />
      </TransparentDiv>
    </div>
  )
}
