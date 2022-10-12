import { NextArrow, PrevArrow } from '@components/Arrows'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { useRef } from 'react'
import Slider from 'react-slick'
import { PerDrawAveragePrizeSize } from './PerDrawAveragePrizeSize'
import { PerDrawPrizeCountDistribution } from './PerDrawPrizeCountDistribution'
import { PerDrawPrizeMoneyDistribution } from './PerDrawPrizeMoneyDistribution'
import { PrizePoolNetworkTvl } from './PrizePoolNetworkTvl'
import { UpcomingPrize } from './UpcomingPrize'

export const PrizePoolNetworkCarouselAutoplayAtom = atom(true)

export const PrizePoolNetworkCarousel = (props: { className?: string }) => {
  const { className } = props
  const [autoplay] = useAtom(PrizePoolNetworkCarouselAutoplayAtom)
  const sliderRef = useRef<{ slickPrev: () => void; slickNext: () => void }>()

  return (
    <div className={classNames('flex flex-col justify-center', className)}>
      <Slider
        ref={sliderRef}
        className='pb-2 xs:pb-4 sm:pb-8 lg:pb-12'
        arrows={false}
        dots={true}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={8000}
      >
        <UpcomingPrize className='py-4 xs:pt-10 xs:pb-4 lg:pt-20 lg:pb-12 my-auto mx-auto max-w-screen-sm' />
        <PrizePoolNetworkTvl className='h-full my-auto mx-auto max-w-screen-sm' />
        <PerDrawPrizeMoneyDistribution className='my-auto mx-auto max-w-screen-sm' />
        <PerDrawPrizeCountDistribution className='my-auto mx-auto max-w-screen-sm' />
        <PerDrawAveragePrizeSize className='my-auto mx-auto max-w-screen-sm' />
      </Slider>
      <SliderArrows prev={sliderRef?.current?.slickPrev} next={sliderRef?.current?.slickNext} />
    </div>
  )
}

export const SliderArrows = (props: { className?: string; prev: () => void; next: () => void }) => {
  const { className, prev, next } = props
  return (
    <div className={classNames('flex justify-between mx-auto pt-0.5 xs:pt-0 lg:-mt-1', className)}>
      <PrevArrow className='text-gradient-magenta' onClick={() => prev?.()} />
      <NextArrow className='text-gradient-magenta' onClick={() => next?.()} />
    </div>
  )
}
SliderArrows.defaultProps = {
  className: 'w-40'
}
