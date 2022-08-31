import { NextArrow, PrevArrow } from '@components/Arrows'
import { InfoList } from '@components/InfoList'
import { Carousel } from '@pooltogether/react-components'
import React from 'react'

export interface InfoBoxProps {
  infoListItems: React.ReactNode
  carouselChildren?: React.ReactNode
}

/**
 * @param props
 * @returns
 */
export const InfoBox: React.FC<InfoBoxProps> = (props) => {
  const { infoListItems, carouselChildren } = props

  if (!carouselChildren) {
    return <InfoList>{infoListItems}</InfoList>
  }

  return (
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
      {infoListItems && <InfoList>{infoListItems}</InfoList>}
      {carouselChildren}
    </Carousel>
  )
}
