import { InfoList } from '@components/InfoList'
import { SliderArrows } from '@views/Deposit/PrizePoolNetworkCarousel'
import React, { useRef } from 'react'
import Slider from 'react-slick'

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
  const sliderRef = useRef<{ slickPrev: () => void; slickNext: () => void }>()

  const prev = () => sliderRef?.current?.slickPrev()
  const next = () => sliderRef?.current?.slickNext()

  if (!carouselChildren) {
    return <InfoList>{infoListItems}</InfoList>
  }

  return (
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
        {infoListItems && <InfoList>{infoListItems}</InfoList>}
        {carouselChildren}
      </Slider>
      <SliderArrows prev={prev} next={next} style={{ width: '84px' }} />
    </div>
  )
}
