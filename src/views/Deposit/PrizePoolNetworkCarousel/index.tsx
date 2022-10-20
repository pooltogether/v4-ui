import { NextArrow, PrevArrow } from '@components/Arrows'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { CSSProperties, useRef } from 'react'
import Slider from 'react-slick'
import { PerDrawPrizeCount } from './PerDrawPrizeCount'
import { PerDrawPrizeValue } from './PerDrawPrizeValue'
import { PrizePoolNetworkTvl } from './PrizePoolNetworkTvl'
import { UpcomingPrize } from './UpcomingPrize'

export const PrizePoolNetworkCarouselAutoplayAtom = atom(true)

export const PrizePoolNetworkCarousel = (props: { className?: string }) => {
  const { className } = props
  const [autoplay] = useAtom(PrizePoolNetworkCarouselAutoplayAtom)
  const sliderRef = useRef<{ slickPrev: () => void; slickNext: () => void }>()

  const prev = () => sliderRef?.current?.slickPrev()
  const next = () => sliderRef?.current?.slickNext()

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
        <UpcomingPrize className='py-10 my-auto mx-auto max-w-screen-sm' />
        <PerDrawPrizeValue className='my-auto mx-auto max-w-screen-sm' />
        <PerDrawPrizeCount className='my-auto mx-auto max-w-screen-sm' />
        <PrizePoolNetworkTvl className='h-full my-auto mx-auto max-w-screen-sm' />
      </Slider>
      <SliderArrows prev={prev} next={next} style={{ width: '116px' }} />
    </div>
  )
}

export const SliderArrows = (props: {
  className?: string
  prev: () => void
  next: () => void
  style?: CSSProperties
}) => {
  const { className, style, prev, next } = props
  return (
    <div
      className={classNames('pointer-events-none z-1 flex justify-between mx-auto', className)}
      style={{ paddingTop: '2.5px', ...style }}
    >
      <PrevArrow
        className='pointer-events-auto text-gradient-magenta'
        onClick={() => prev?.()}
        arrowSizeClassName='w-5 h-5'
      />
      <NextArrow
        className='pointer-events-auto text-gradient-magenta'
        onClick={() => next?.()}
        arrowSizeClassName='w-5 h-5'
      />
    </div>
  )
}

export const CarouselHeader = (props: { headers: { title: string; stat: React.ReactNode }[] }) => (
  <div
    className={`grid grid-cols-${props.headers.length} mx-auto font-bold text-center max-w-screen-xs`}
  >
    {props.headers.map(({ title, stat }, index) => (
      <div key={`header-${title}`} className='flex flex-col'>
        <span>{title}</span>
        <span className='text-7xl xs:text-12xl leading-none'>{stat}</span>
      </div>
    ))}
  </div>
)

export const CarouselDescription = (props: JSX.IntrinsicElements['div']) => (
  <div
    {...props}
    className={classNames(
      'text-xxxs xs:text-xs lg:text-sm opacity-70 mt-2 sm:mt-4 text-center max-w-screen-xs lg:max-w-2xl mx-auto leading-tight',
      props.className
    )}
  />
)
