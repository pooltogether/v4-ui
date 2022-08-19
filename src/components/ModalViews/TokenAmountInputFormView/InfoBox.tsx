import { InfoList } from '@components/InfoList'
import { TransparentDiv } from '@components/TransparentDiv'
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
    <Carousel className='-mx-2 xs:-mx-8'>
      {infoListItems && <InfoList>{infoListItems}</InfoList>}
      {carouselChildren}
    </Carousel>
  )
}
