import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Carousel } from '@pooltogether/react-components'
import { UpcomingPrize } from './UpcomingPrize'
import { PrizeBreakdown as PrizeBreakdownTable } from '@components/PrizeBreakdown'
import { PerDrawPrizeMoneyDistribution } from './PerDrawPrizeMoneyDistribution'
import { LastDrawWinners } from './LastDrawWinners'
import FeatherIcon from 'feather-icons-react'
import { PerDrawPrizeCountDistribution } from './PerDrawPrizeCountDistribution'
import { PrizePoolNetworkTvl } from './PrizePoolNetworkTvl'
import classNames from 'classnames'
import { PerDrawAveragePrizeSize } from './PerDrawAveragePrizeSize'
import { NextArrow, PrevArrow } from '@components/Arrows'

export const NetworkCarousel = () => {
  return (
    <Carousel
      marginClassName=''
      className='pb-2'
      settings={{
        arrows: true,
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
      }}
    >
      <UpcomingPrize className='mx-auto' />
      <PrizePoolNetworkTvl className='mx-auto' />
      <PerDrawPrizeMoneyDistribution className='mx-auto' />
      <PerDrawPrizeCountDistribution className='mx-auto' />
      <PerDrawAveragePrizeSize className='mx-auto' />
    </Carousel>
  )
}
