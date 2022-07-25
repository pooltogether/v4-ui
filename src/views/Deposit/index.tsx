import React from 'react'

import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'
import { Carousel } from '@pooltogether/react-components'
import { DepositTrigger } from './DepositTrigger'

export const DepositUI = () => (
  <PagePadding paddingClassName=''>
    <Carousel className='mb-8 sm:mb-12'>
      <UpcomingPrizeCard className='mt-4' />
    </Carousel>
    <div className='px-2 pb-20'>
      <DepositTrigger />
      {/* <DepositCard />
    <VotingPromptCard /> */}
    </div>
  </PagePadding>
)
