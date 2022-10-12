import { PagePadding } from '@components/Layout/PagePadding'
import React from 'react'
import { DepositTrigger } from './DepositTrigger'
import { RewardsBanners } from './DepositTrigger/RewardsBanners'
import { PrizePoolNetworkCarousel } from './PrizePoolNetworkCarousel'

export const DepositUI = () => {
  return (
    <PagePadding
      paddingClassName=''
      widthClassName=''
      marginClassName=''
      className='h-actually-full-screen -mt-12 sm:-mt-16 flex flex-col justify-center space-y-4 sm:space-y-8 lg:space-y-12'
      style={{ minHeight: '620px' }}
    >
      {/* <div className='h-full flex flex-col justify-evenly sm:justify-center'> */}
      <RewardsBanners />
      <PrizePoolNetworkCarousel
      // className='mt-4 sm:mt-8 lg:mt-12'
      />
      <DepositTrigger
      // className='mt-4 sm:mt-8 lg:mt-12'
      />
      {/* </div> */}
    </PagePadding>
  )
}
