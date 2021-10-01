import classNames from 'classnames'
import React from 'react'
import Slider from 'react-slick'

interface DrawCarouselProps {
  className?: string
  children: React.ReactNode
}

export const DrawCarousel = (props: DrawCarouselProps) => {
  const { className, children } = props

  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  }
  return <Slider {...settings} className={classNames(className, 'space-x-4')} children={children} />
}
