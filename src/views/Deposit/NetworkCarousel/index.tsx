import { NextArrow, PrevArrow } from '@components/Arrows'
import { Carousel } from '@pooltogether/react-components'
import { atom, useAtom } from 'jotai'
import { PerDrawAveragePrizeSize } from './PerDrawAveragePrizeSize'
import { PerDrawPrizeCountDistribution } from './PerDrawPrizeCountDistribution'
import { PerDrawPrizeMoneyDistribution } from './PerDrawPrizeMoneyDistribution'
import { PrizePoolNetworkTvl } from './PrizePoolNetworkTvl'
import { UpcomingPrize } from './UpcomingPrize'

export const networkCarouselAutoplayAtom = atom(true)

export const NetworkCarousel = () => {
  const [autoplay] = useAtom(networkCarouselAutoplayAtom)

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
        prevArrow: <PrevArrow />,
        autoplay,
        autoplaySpeed: 8000
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
