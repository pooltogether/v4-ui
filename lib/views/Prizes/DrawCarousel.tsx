import FeatherIcon from 'feather-icons-react'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import { ScreenSize, useScreenSize } from '@pooltogether/hooks'

interface DrawCarouselProps {
  children: React.ReactChild[] & React.ReactNode
}

const useCenterSliderPercentage = () => {
  const screenSize = useScreenSize()
  if (screenSize <= ScreenSize.xs) {
    return 100
  } else if (screenSize <= ScreenSize.sm) {
    return 75
  } else {
    return 50
  }
}

export const DrawCarousel = (props: DrawCarouselProps) => {
  const { children } = props

  const centerSlidePercentage = useCenterSliderPercentage()

  return (
    <Carousel
      centerMode
      swipeable
      emulateTouch
      infiniteLoop
      useKeyboardArrows
      autoPlay={false}
      showStatus={false}
      selectedItem={0}
      swipeScrollTolerance={10}
      // NOTE: Temporary work around, make auto play changes super high.
      // Waiting to update to a version > 3.2.21.
      interval={99999999999999}
      centerSlidePercentage={centerSlidePercentage}
      preventMovementUntilSwipeScrollTolerance
      renderArrowNext={ArrowNext}
      renderArrowPrev={ArrowPrev}
    >
      {children}
    </Carousel>
  )
}

const ArrowNext = (clickHandler: () => void, hasNext: boolean, label: string) => {
  if (!hasNext) return null
  return (
    <button onClick={clickHandler} className='absolute right-0 inset-y-0 z-10'>
      <Arrow icon='chevron-right' />
    </button>
  )
}

const ArrowPrev = (clickHandler: () => void, hasNext: boolean, label: string) => {
  if (!hasNext) return null
  return (
    <button onClick={clickHandler} className='absolute left-0 inset-y-0 z-10'>
      <Arrow icon='chevron-left' />
    </button>
  )
}

const Arrow = (props: { icon: string }) => (
  <FeatherIcon icon={props.icon} className='relative w-6 h-6 sm:w-8 sm:h-8 mr-1 inline-block' />
)
