import { ExpectedPrizeBreakdown } from '@components/ExpectedPrizeBreakdown'
import { RoundButton } from '@components/Input/RoundButton'
import { TransparentDiv } from '@components/TransparentDiv'
import { ViewProps } from '@pooltogether/react-components'
import { SliderArrows } from '@views/Deposit/PrizePoolNetworkCarousel'
import { useRef } from 'react'
import Slider from 'react-slick'
import { ViewIds } from '..'
import { BalanceHeader } from './BalanceHeader'

export const MainView: React.FC<{} & ViewProps> = (props) => {
  const { setSelectedViewId } = props
  const sliderRef = useRef<{ slickPrev: () => void; slickNext: () => void }>()

  return (
    <div className='flex flex-col h-full justify-between'>
      <div>
        <Slider
          ref={sliderRef}
          className='-mx-2 xs:-mx-8 pb-2'
          arrows={true}
          dots={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
        >
          <BalanceHeader key='balance-header' />
          <TransparentDiv
            key='expected-prize-breakdown'
            className='px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-48'
          >
            <ExpectedPrizeBreakdown className='mx-auto' />
          </TransparentDiv>
        </Slider>
        <SliderArrows
          prev={sliderRef?.current?.slickPrev}
          next={sliderRef?.current?.slickNext}
          className='w-28'
        />
      </div>
      <div className='flex justify-evenly mt-8'>
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
          onClick={() => setSelectedViewId(ViewIds.delegate)}
          icon={'gift'}
          label={'Share'}
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
