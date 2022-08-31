import { NextArrow, PrevArrow } from '@components/Arrows'
import { ExpectedPrizeBreakdown } from '@components/ExpectedPrizeBreakdown'
import { RoundButton } from '@components/Input/RoundButton'
import { TransparentDiv } from '@components/TransparentDiv'
import { Carousel, ViewProps } from '@pooltogether/react-components'
import { useRouter } from 'next/router'
import { ViewIds } from '..'
import { BalanceHeader } from './BalanceHeader'

export const MainView: React.FC<{} & ViewProps> = (props) => {
  const { setSelectedViewId } = props

  return (
    <div className='flex flex-col h-full justify-between space-y-8'>
      <Carousel
        className='-mx-2 xs:-mx-8'
        settings={{
          arrows: true,
          dots: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1
          // nextArrow: <NextArrow />,
          // prevArrow: <PrevArrow />
        }}
      >
        <BalanceHeader key='balance-header' />
        <TransparentDiv
          key='expected-prize-breakdown'
          className='px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-48'
        >
          <ExpectedPrizeBreakdown className='mx-auto' />
        </TransparentDiv>
      </Carousel>
      <div className='flex justify-evenly'>
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.deposit)}
          icon={'arrow-down'}
          label={'Deposit'}
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.withdraw)}
          icon={'arrow-up'}
          label={'Withdraw'}
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.moreInfo)}
          icon={'info'}
          label={'Info'}
        />
      </div>
    </div>
  )
}
