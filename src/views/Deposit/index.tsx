import React from 'react'

import { PagePadding } from '@components/Layout/PagePadding'
import { NetworkCarousel } from './NetworkCarousel'
import { DepositTrigger } from './DepositTrigger'
import { Footer } from './Footer'

export const DepositUI = () => {
  return (
    <PagePadding
      paddingClassName=''
      widthClassName=''
      marginClassName=''
      className='absolute inset-0'
    >
      <div className='mx-auto h-full pt-11 sm:pt-14 flex flex-col'>
        <div className='h-full flex flex-col justify-center space-y-16 xs:space-y-20 md:space-y-28'>
          <NetworkCarousel />
          <DepositTrigger />
        </div>
        <Footer />
      </div>
    </PagePadding>
  )
}
