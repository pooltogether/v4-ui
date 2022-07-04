import React from 'react'

import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'
import { Carousel } from '@pooltogether/react-components'
import { DepositTrigger } from './DepositTrigger'

export const DepositUI = () => (
  <PagePadding className='flex flex-col space-y-6'>
    <Carousel>
      <UpcomingPrizeCard className='mt-4' />
      <p className='w-full bg-pt-red'>Yo. TestingTestingTesting</p>
    </Carousel>
    <DepositTrigger />
    {/* <DepositCard />
    <VotingPromptCard /> */}
  </PagePadding>
)
